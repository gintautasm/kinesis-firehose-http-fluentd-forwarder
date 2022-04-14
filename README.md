# Fluentd container for Kinesis Firehose HTTP destination

# whats inside

- [Ruby FluentD logger](https://github.com/fluent/fluent-logger-ruby#singleton)
- [Ruby Agoo http server](https://github.com/ohler55/agoo)
- [Debian Fluend container](https://github.com/fluent/fluentd-docker-image#debian-version)
- [Optional: Oj json serializer](https://github.com/ohler55/oj)

# how it works

Solution is required as Kinesis Firehose requires specific response
for HTTP destination

- Agoo http server is started
- fluend daemon with forward input started
- HTTP server connects its FluentD logger on localhost 
- HTTP server logs output

# build / run / test

```
docker build \
    -t "fluentd-with-http-server" \
    -f Dockerfile .

docker run --rm \
    -p 6464:6464 \
    "fluentd-with-http-server"

curl -iv -X POST \
    http://localhost:6464/hello \
    -H 'Content-Type: application/json,charset=utf8' \
    -H 'Accept: application/json,charset=utf8' \
    -d '{
        "RequestId":1,
        "my-message":"this should work"
    }'
```