#!/bin/bash

# Kill any existing Jekyll processes
echo "Checking for existing Jekyll processes..."
JEKYLL_PIDS=$(ps aux | grep jekyll | grep -v grep | awk '{print $2}')
if [ ! -z "$JEKYLL_PIDS" ]; then
  echo "Killing existing Jekyll processes: $JEKYLL_PIDS"
  kill $JEKYLL_PIDS
  sleep 2
fi

# Make sure we're using the right Ruby
export PATH="/opt/homebrew/opt/ruby@3.2/bin:$PATH"

# Check Ruby version
echo "Using Ruby: $(ruby --version)"
echo "Using Bundler: $(bundle --version)"

# Check if port is already in use
PORT=${1:-4000}
if lsof -i :$PORT > /dev/null; then
  echo "Port $PORT is already in use. Please choose another port or kill the process using it."
  exit 1
fi

# Run Jekyll with the specified port
echo "Starting Jekyll server on http://localhost:$PORT"
JEKYLL_ENV=development bundle exec jekyll serve --port $PORT

# This line will only execute if Jekyll exits on its own
echo "Jekyll server has stopped." 