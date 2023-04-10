package service

import (
	"encoding/json"
	"gophre/cmd/data"
	"gophre/env"
	"log"
	"os"
)

func Reset() {
	// Charger les sources RSS à partir d'un fichier JSON
	var allArticles []data.Article
	updatedFile, err := json.MarshalIndent(allArticles, "", "  ")
	if err != nil {
		log.Printf("Error encoding JSON: %v\n", err)
		return
	}

	err = os.WriteFile(env.POSTS, updatedFile, 0644)
	if err != nil {
		log.Printf("Error writing file: %v\n", err)
		return
	}
}

