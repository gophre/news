package web

import (
	"encoding/json"
	"fmt"
	"gophre/cmd/data"
	"gophre/env"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/microcosm-cc/bluemonday"
)

func Bookmarks(c *gin.Context) {
	file, err := os.ReadFile(env.POSTS)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Error reading file: %v", err))
		return
	}

	var articles []data.Article
	err = json.Unmarshal(file, &articles)
	if err != nil {
		c.String(http.StatusInternalServerError, fmt.Sprintf("Error decoding JSON: %v", err))
		return
	}

	p := bluemonday.UGCPolicy()
	var goodArticles []data.Article
	for _, article := range articles {
		if article.Vote > 0 {
			article.Resume = p.Sanitize(article.Resume)
			goodArticles = append(goodArticles, article)
		}
	}

	c.HTML(http.StatusOK, "list.html", gin.H{
		"articles": goodArticles,
	})
}
