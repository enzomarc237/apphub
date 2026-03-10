APP_NAME=AppHuub
DIST_DIR=dist
BUILD_DIR=build

.PHONY: all build clean test build-macos build-linux build-windows

all: build

build: clean build-frontend build-go

build-frontend:
	npm install
	npm run build

build-go:
	go build -o $(APP_NAME) main.go

build-macos: clean build-frontend
	GOOS=darwin GOARCH=amd64 go build -o $(APP_NAME)-macos-amd64 main.go

clean:
	rm -rf $(DIST_DIR)
	rm -rf $(APP_NAME)*

test:
	npm test
