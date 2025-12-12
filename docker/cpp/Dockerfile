FROM gcc:latest
WORKDIR /app
# We will mount main.cpp
# Compile and run script
COPY run.sh /app/run.sh
RUN chmod +x /app/run.sh
ENTRYPOINT ["/app/run.sh"]
