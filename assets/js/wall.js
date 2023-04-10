let currentPage = 0;
let currentDate = "2040-02-02";
const container = document.getElementById('articlesContainer');
function sanitizeHTML(html) {
	const parser = new DOMParser();
	const doc = parser.parseFromString(html, 'text/html');
	return doc.body.textContent || '';
}

let oldFilter = ""

async function liveSearch() {
    const urlParams = new URLSearchParams(window.location.search);
	const input = document.getElementById('searchInput');
	let filter = input.value.toLowerCase();

	if (filter == "" && filter==oldFilter) {
		if (urlParams.get('q')!="") {
			input.value = urlParams.get('q');
			filter = urlParams.get('q');
		}
	}

	oldFilter = filter
	
    const url = new URL(window.location);
	if (filter!="" && filter != null) {
		url.searchParams.set('q', filter);
    	window.history.pushState(null, '', url);

		filter = encodeURIComponent(filter)
		container.innerHTML = "";

		const res = await fetch(`/search?q=${filter}`);
    	const articles = await res.json();

		articles.forEach(article => {

			let sourceName = article.source ? article.source.name : 'N/A';
			let sourceUrl = article.source ? article.source.path : '#';
			let dateName = article.date ? article.date.substring(0,10) : '';
			dateName = dateName.substr(8,2)+"/"+dateName.substr(5,2)+"/"+dateName.substr(0,4);

			if (currentDate!=dateName && dateName!="") {
				const h2Div = document.createElement('when');
				h2Div.innerHTML = dateName;
				container.appendChild(h2Div);
			}
			currentDate=dateName;

			let voteDiv = document.createElement('buttons');
			let existingVote = localStorage.getItem(`vote_${voteDiv.id}`);
			voteDiv.id="buttons"+voteDiv.id;
			if (existingVote) {
				voteDiv.className = existingVote;
				document.getElementById("allPostsLink").classList.remove("hidden");
			}

			let articleDiv = document.createElement('article');
			articleDiv.id=article.id;

			voteDiv.innerHTML = `
			<buttonsblock>
				<button class="good" href="'${article.id}'" onclick="vote('${article.id}', 'GOOD')">KEEP</button>
				<button class="bad" href="'${article.id}'" onclick="vote('${article.id}', 'BAD')">REALLY NOT<br>INTERESTED</button>
			</buttonsblock>
			<articlesource><a href="${sourceUrl}" target="_self">${sourceName}</a></articlesource>
			<articletitle`+ (article.resume != "" ? '' : ' class = "small"') +`><a href="${article.url}">${article.name}</a></articletitle>
			`;
			container.appendChild(voteDiv);

			if (existingVote) {
				// voteButtons = `<p>Voted: ${article.vote}</p>`
			}

			if (article.resume != "") {
				articleDiv.innerHTML = `
				<resume>${article.resume}</resume>
				`;
				container.appendChild(articleDiv);
			}
		});
	} else {
		url.searchParams.delete('q', filter);
    	window.history.pushState(null, '', url);
		container.innerHTML = "";
		loadMoreArticles();
	}
}

async function loadMoreArticles() {
	currentPage += 1;
	const res = await fetch(`/feed?path=${path}&page=${currentPage}&size=${pageSize}`);
	const articles = await res.json();

	articles.forEach(article => {

		let sourceName = article.source ? article.source.name : 'N/A';
		let sourceUrl = article.source ? article.source.path : '#';
		let dateName = article.date ? article.date.substring(0,10) : '';
		dateName = dateName.substr(8,2)+"/"+dateName.substr(5,2)+"/"+dateName.substr(0,4);

		if (currentDate!=dateName && dateName!="") {
			const h2Div = document.createElement('when');
			h2Div.innerHTML = dateName;
			container.appendChild(h2Div);
		}
		currentDate=dateName;

		let itemDiv = document.createElement('item');

		let articleDiv = document.createElement('article');
		articleDiv.id=article.id;
		let existingVote = localStorage.getItem(`vote_${article.id}`);
		if (existingVote) {
			articleDiv.className = existingVote;
			document.getElementById("allPostsLink").classList.remove("hidden");
		}

		let voteDiv = document.createElement('buttons');
		voteDiv.id="buttons"+article.id;
		if (existingVote) {
			voteDiv.className = existingVote;
		}

		voteDiv.innerHTML = `
		<buttonsblock>
			<button class="good" href="'${article.id}'" onclick="vote('${article.id}', 'GOOD')">KEEP</button>
			<button class="bad" href="'${article.id}'" onclick="vote('${article.id}', 'BAD')">REALLY NOT<br>INTERESTED</button>
		</buttonsblock>
		<articlesource><a href="${sourceUrl}" target="_self">${sourceName}</a></articlesource>
		<articletitle`+ (article.resume != "" ? '' : ' class = "small"') +`><a href="${article.url}">${article.name}</a></articletitle>
		`;
		itemDiv.appendChild(voteDiv);

		if (existingVote) {
			// voteButtons = `<p>Voted: ${article.vote}</p>`
		}

		if (article.resume != "") {
			articleDiv.innerHTML = `
			<resume>${article.resume}</resume>
			`;
			itemDiv.appendChild(articleDiv);
		}

		container.appendChild(itemDiv);

	});

	let moreDiv = document.createElement('button');
	moreDiv.classList.add("more");
	moreDiv.addEventListener("click", function() {
		loadMoreArticles();
	});
	moreDiv.innerHTML = "Load next";
	container.appendChild(moreDiv);
}


/*
	async function vote(articleUrl, note) {
		await fetch(`/vote?url=${encodeURIComponent(articleUrl)}&note=${note}`);
	}
*/

async function vote(id, voteValue) {

	// Removing the buttons and adding a paragraph with the vote value.
	const voteDiv = document.getElementById("buttons"+id);
	if (voteDiv) {
		localStorage.setItem(`vote_${id}`, voteValue);
		document.getElementById("allPostsLink").classList.remove("hidden");
		voteDiv.classList.remove("GOOD");
		voteDiv.classList.remove("BAD");
		voteDiv.classList.add(voteValue);
	}

	// Find the corresponding article div by searching for a link with the matching URL
	const articleDiv = document.getElementById(id);
	if (articleDiv) {
		// Add the vote value as a class to the article div
		articleDiv.classList.remove("GOOD");
		articleDiv.classList.remove("BAD");
		articleDiv.classList.add(voteValue);

		// Remove the vote buttons and display the vote value
		const buttons = voteDiv.querySelectorAll('button');
		buttons.forEach(button => button.remove());
		const voteParagraph = document.createElement('p');
		voteParagraph.textContent = `Voted: ${voteValue}`;
		articleDiv.appendChild(voteParagraph);
	}

}

function handleScroll() {
	const scrollTop = (document.documentElement && document.documentElement.scrollTop) || document.body.scrollTop;
	const scrollHeight = (document.documentElement && document.documentElement.scrollHeight) || document.body.scrollHeight;
	const clientHeight = document.documentElement.clientHeight || window.innerHeight;

	const articles = document.querySelectorAll('article');
	articles.forEach(article => {
		const rect = article.getBoundingClientRect();
		if (rect.bottom < 0) {
			const badButton = article.querySelector('button:last-child');
			if (badButton) {
				// badButton.click();
			}
		}
	});

	if (scrollTop + clientHeight >= scrollHeight - 100) {
		loadMoreArticles();
		window.removeEventListener('scroll', handleScroll);
	}
}

function debounce(func, wait) {
	let timeout;
	return function (...args) {
		const context = this;
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(context, args), wait);
	};
}

window.addEventListener('scroll', debounce(handleScroll, 200));
liveSearch("");
