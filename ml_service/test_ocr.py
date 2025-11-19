import requests
import sys

def test_health():
    try:
        response = requests.get('http://localhost:5001/api/health')
        print("Health Check:", response.json())
        return response.status_code == 200
    except Exception as e:
        print(f"Health check failed: {e}")
        return False

def test_parse_document(file_path):
    try:
        with open(file_path, 'rb') as f:
            files = {'file': f}
            response = requests.post(
                'http://localhost:5001/api/parse-document',
                files=files
            )

        result = response.json()
        print("\nParse Document Result:")
        print(f"Success: {result.get('success')}")
        print(f"Total Extracted: {result.get('total_extracted')}")
        print(f"Total Valid: {result.get('total_valid')}")

        if result.get('questions'):
            print(f"\nFirst Question:")
            q = result['questions'][0]
            print(f"  Text: {q.get('text')}")
            print(f"  Options: {q.get('options')}")
            print(f"  Answer: {q.get('answer')}")

        return response.status_code in [200, 400]
    except Exception as e:
        print(f"Parse document test failed: {e}")
        return False

if __name__ == '__main__':
    print("Testing ML Service...\n")

    if not test_health():
        print("ML Service is not running. Start it with: python app.py")
        sys.exit(1)

    if len(sys.argv) > 1:
        test_parse_document(sys.argv[1])
    else:
        print("\nTo test document parsing, run:")
        print("python test_ocr.py /path/to/document.pdf")
