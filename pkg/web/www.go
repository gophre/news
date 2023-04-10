package web

import (
	"gophre/env"
	"gophre/pkg/rss"
	"html/template"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

// Gin web framework setuo
// Custom functions
// Rate limiter
// Routes

func Serve(port ...int) {

	// Server Port
	goodPort := env.PORT
	if len(port) > 0 {
		goodPort = port[0]
	}

	// Define custom functions
	customFuncs := template.FuncMap{
		"safe": func(s string) template.HTML {
			return template.HTML(s)
		},
	}

	// Rate limiter
	limiter := NewLimiter(rate.Every(1*time.Second), 500) // Adjust these values as needed

	// Gin setup
	r := gin.Default()
	r.SetFuncMap(customFuncs)
	r.Use(RateLimiterMiddleware(limiter))
	r.LoadHTMLGlob(env.PATH + "assets/html/*")
	r.Static("/css", env.PATH+"assets/css")
	r.Static("/gfx", env.PATH+"assets/gfx")
	r.Static("/js", env.PATH+"assets/js")

	// Website
	r.GET("/", Wall)
	r.GET("/all", All)
	r.GET("/me", Bookmarks)

	// API POST
	r.POST("/vote/:id/:vote", Vote)

	// API GET
	r.GET("/article/:id", Article)
	r.GET("/feed", Feed)
	r.GET("/search", func(c *gin.Context) {
		q := c.Query("q")
		searchResults := rss.Search(q, rss.Feed("", "1", "16777216"))
		c.JSON(200, searchResults)
	})

	// Check all articles from one topic
	r.GET("/:path", Topic)

	// Start the server
	r.Run(":" + strconv.Itoa(goodPort))

}

// It returns the article by ID
func Article(c *gin.Context) {
	uid := c.Param("id")
	c.JSON(200, rss.Article(uid))
}

// It takes a path, page and number of elements per page (size), and returns a JSON response with the RSS feed
func Feed(c *gin.Context) {
	path := c.DefaultQuery("path", "")
	page := c.DefaultQuery("page", "1")
	size := c.DefaultQuery("size", "30")
	c.JSON(200, rss.Feed(path, page, size))
}

// It takes the path parameter from the URL, and passes it to the Topic function in the rss package.
// The Topic function returns a slice of articles, which is then passed to the search.html template
func Topic(c *gin.Context) {
	path := c.Param("path")
	c.HTML(http.StatusOK, "wall.html", gin.H{
		// "articles": rss.Topic(path),
		"path": path,
	})
}
