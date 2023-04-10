#!/usr/bin/bash
GOODPATH="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd $GOODPATH
cd ../

# Screenshot
cd $GOODPATH
cd ../
cat cmd/main.go | snippit --syntax go --out README.png
boum .

# Build
cd $GOODPATH
cd ../
go mod tidy
# reduced size: go build -ldflags "-s -w" -o build/pm cmd/main.go
go build -ldflags "-s -w" -o bin/gophre cmd/main.go
service gophre stop
service gophre start
