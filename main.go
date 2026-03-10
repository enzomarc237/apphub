package main

import (
	"embed"
	"io/fs"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
)

//go:embed dist/*
var content embed.FS

func main() {
	// Get the subtree for the "dist" folder
	distFS, err := fs.Sub(content, "dist")
	if err != nil {
		log.Fatal(err)
	}

	mux := http.NewServeMux()

	// File server for static assets
	fileServer := http.FileServer(http.FS(distFS))

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Clean the path
		p := strings.TrimPrefix(path.Clean(r.URL.Path), "/")

		// If path is empty (root), serve index.html via fileServer
		if p == "" || p == "." {
			fileServer.ServeHTTP(w, r)
			return
		}

		// Check if the file exists in the embedded FS
		f, err := distFS.Open(p)
		if err != nil {
			// If file doesn't exist, and it doesn't look like a file with an extension,
			// serve index.html for SPA routing by resetting the path.
			if !strings.Contains(path.Base(p), ".") {
				r.URL.Path = "/"
				fileServer.ServeHTTP(w, r)
				return
			}
			http.NotFound(w, r)
			return
		}
		f.Close()

		// Serve the file
		fileServer.ServeHTTP(w, r)
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s...", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
