#!/usr/bin/env python3
import os
import sys
import argparse
import getpass
import subprocess
from twitter_scraper import Twitter_Scraper

import logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

# load .env
try:
    from dotenv import load_dotenv
    load_dotenv()
    logging.info("Loaded .env file")
except Exception as e:
    logging.error(f"Error loading .env: {e}")
    sys.exit(1)

def main():
    parser = argparse.ArgumentParser(
        description="Twitter Scraper (no API). Scrape a single tweet by URL, a user profile, or run a search query."
    )

    # credentials
    parser.add_argument("--mail",     type=str, default=os.getenv("TWITTER_MAIL"),     help="Your Twitter email")
    parser.add_argument("--user",     type=str, default=os.getenv("TWITTER_USERNAME"), help="Your Twitter username")
    parser.add_argument("--password", type=str, default=os.getenv("TWITTER_PASSWORD"), help="Your Twitter password")
    parser.add_argument("--headless", type=str, default=os.getenv("HEADLESS"),         help="[yes/no] run headless")

    # NEW: single‐tweet URL
    parser.add_argument(
        "--tweet",
        type=str,
        default=None,
        help="Full tweet URL to scrape (e.g. https://x.com/.../status/1234)"
    )

    # profile or query
    parser.add_argument(
        "-u", "--username",
        type=str,
        default=None,
        help="Scrape tweets from a user profile"
    )
    parser.add_argument(
        "-q", "--query",
        type=str,
        default=None,
        help="Scrape tweets matching a search query"
    )

    parser.add_argument(
        "-t", "--tweets",
        type=int,
        default=5,
        help="Max number of tweets to fetch (default: 5)"
    )

    args = parser.parse_args()

    # prompt for missing creds
    if not args.user:
        args.user = input("Twitter Username: ")
    if not args.password:
        args.password = getpass.getpass("Twitter Password: ")
    if not args.headless:
        args.headless = input("Headless? [yes/no]: ").lower()

    logging.info(f"Starting scrape; mode={'tweet URL' if args.tweet else 'profile/query'}")

    # instantiate scraper
    scraper = Twitter_Scraper(
        mail=args.mail,
        username=args.user,
        password=args.password,
        headlessState=args.headless
    )
    scraper.login()

    # dispatch
    if args.tweet:
        # scrape a single tweet
        scraper.scrape_by_url(
            tweet_url=args.tweet,
            max_tweets=1
        )
    elif args.username:
        scraper.scrape_tweets(
            scrape_username=args.username,
            max_tweets=args.tweets,
            scrape_query=None
        )
    elif args.query:
        scraper.scrape_tweets(
            scrape_query=args.query,
            max_tweets=args.tweets
        )
    else:
        print("Please specify --tweet, --username, or --query.")
        sys.exit(1)

    out_csv = scraper.save_to_csv()
    scraper.driver.quit()

    # if we scraped a single URL, register it on-chain
    if args.tweet:
        print("Registering IP asset on-chain…")
        # assume register_ip.py takes `--file path/to.csv`
        subprocess.run(
            ["python", "register_ip.py", "--file", out_csv],
            check=True
        )
        print("Done.")

if __name__ == "__main__":
    main()
