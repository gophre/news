package rss

import (
	"gophre/cmd/data"
	"strings"
)

func Search(query string, articles []data.Article) []data.Article {
	var results []data.Article

	// Convert the query to lowercase for case-insensitive search
	query = strings.ToLower(query)

	for _, article := range articles {
		if strings.Contains(strings.ToLower(article.Name), query) || strings.Contains(strings.ToLower(article.Resume), query) {
			results = append(results, article)
		}
	}

	return results
}
