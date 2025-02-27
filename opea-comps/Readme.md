## Running Ollama Third-Party Service 

## choosing a model

You can get the model_id that ollama will launch from the [ollama Library](https://ollama.com/library).

Get your IP Address
```
ipconfig
```

NO_PROXY=localhost LLM_ENDPOINT_PORT=8008 LLM_MODEL_ID="llama3.2:1b" host_ip=192.168.2.254 docker-compose up

## ollama API
Once the ollama server is running we can make API calls to the ollama API

https://github.com/ollama/ollama/blob/main/docs/api.md

## Download(pull) a model
curl http://localhost:8008/api/pull -d '{"model": "llama3.2:1b"}'

## Generate a request
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.2:1B",
  "prompt": "Why is the sky blue?"
}'

# Technical uncertainity
#### Q: which port is being mapped 8008->11434
```
You are mapping port 8008 on your host machine to port 11434 inside the Docker container.11434 is the default port that Ollama uses inside the container.
8008 is the port on your host machine that you're using to access the Ollama API.
```
#### Q: Will the model be downloaded in the container? Does that mean that the model will be deleted once the container stops running?
```
The model will be downloaded inside the container when you first use it. However, whether it persists depends on your Docker Compose configuration.
Without volume mapping, the model will be deleted when the container is removed (not just stopped). This happens because Docker containers are ephemeral by default - their file systems don't persist unless explicitly configured to do so.
```