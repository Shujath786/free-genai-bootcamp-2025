import chromadb
import os

# setup Chroma in-memory, for easy prototyping. Can add persistence easily!
client = chromadb.Client()

# Create collection. get_collection, get_or_create_collection, delete_collection also available!
collection = client.create_collection("arabic-transcripts")

# Add docs to the collection. Can also update and delete. Row-based API coming soon!
transcripts_dir = os.path.join(os.path.dirname(__file__), 'transcripts')
documents = []
metadatas = []
ids = []

# Read documents from transcripts directory
for filename in os.listdir(transcripts_dir):
    if filename.endswith('.txt'):
        file_path = os.path.join(transcripts_dir, filename)
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                doc = f.read()
                documents.append(doc)
                metadatas.append({"source": filename})
                ids.append(filename)
        except Exception as e:
            print(f"Error reading {filename}: {str(e)}")

if documents:
    collection.add(
        documents=documents,
        metadatas=metadatas,
        ids=ids,
    )
    print(f"Added {len(documents)} documents to collection")
else:
    print("No documents found in transcripts directory")

# Example query
if documents:
    results = collection.query(
        query_texts=["This is a query document"],
        n_results=2,
    )
    print(results)