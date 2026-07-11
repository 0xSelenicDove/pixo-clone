import urllib.request
import ssl

url = "https://0xselenicdove.github.io/pixo-clone/scraped-next/static/chunks/8fbdf37b65524b90.css"
ssl_context = ssl._create_unverified_context()

try:
    req = urllib.request.Request(
        url, 
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'}
    )
    with urllib.request.urlopen(req, context=ssl_context) as response:
        code = response.getcode()
        length = len(response.read())
        print(f"URL: {url}")
        print(f"Status: {code}")
        print(f"Length: {length} bytes")
        
        with open("/Users/hutao/github/pixo-clone/url_check_result.txt", "w") as f:
            f.write(f"URL: {url}\nStatus: {code}\nLength: {length} bytes\n")
except Exception as e:
    print(f"Error fetching URL: {e}")
    with open("/Users/hutao/github/pixo-clone/url_check_result.txt", "w") as f:
        f.write(f"Error: {e}\n")
