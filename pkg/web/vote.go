package web

import (
	"fmt"
	"gophre/pkg/rss"

	"github.com/gin-gonic/gin"
)

func Vote(c *gin.Context) {
	id := c.Param("id")
	vote := c.Param("vote")
	allArticles := rss.Feed("", "1", "16777216")
	success := false

	for _, article := range allArticles {
		if article.ID == id && vote == "GOOD" {
			article.Vote = 1
			success = true
		}
	}

	fmt.Println(success)
}
