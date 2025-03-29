# Sandeep Salwan's Personal Website

## Local Development

This site is built with Jekyll 4.2.x. There are two scripts to help run the site locally:

### Option 1: Using Bundler (Preferred)

```bash
./start-jekyll.sh [port]
```

This script:
1. Kills any existing Jekyll processes
2. Ensures the correct Ruby version is used
3. Starts Jekyll on the specified port (default: 4000)

### Option 2: Direct Jekyll Method

```bash
./use-homebrew-jekyll.sh [port]
```

This script:
1. Uses Jekyll installed directly via Ruby gems
2. Avoids bundler issues
3. Starts Jekyll on the specified port (default: 4000)

## Common Issues

If you encounter errors:

1. **Ruby Version Issues**: The site requires Ruby 3.2.x. The scripts above handle this automatically.

2. **Port Already in Use**: The scripts check for port availability. If you see "Address already in use" errors, 
   either use a different port (`./start-jekyll.sh 4001`) or kill the process using the port.

3. **Bundler Version Mismatch**: If bundler version errors occur, try the alternative script.

## Viewing the Site

Your site will be available at: http://localhost:4000 (or the port you specified)
