#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME="jstnotes-v2"
CONTAINER_NAME="jstnotes-v2"
PORT="${PORT:-3000}"

echo "==> Building Podman image: ${IMAGE_NAME}..."
podman build -t "${IMAGE_NAME}" -f Containerfile .

echo "==> Checking if existing container '${CONTAINER_NAME}' is running..."
if podman ps -a --format '{{.Names}}' | grep -Eq "^${CONTAINER_NAME}\$"; then
    echo "Stopping and removing existing container '${CONTAINER_NAME}'..."
    podman rm -f "${CONTAINER_NAME}"
fi

ENV_FLAGS=()
if [ -f .env ]; then
    echo "Found .env file, passing to container..."
    ENV_FLAGS+=(--env-file .env)
elif [ -n "${GEMINI_API_KEY:-}" ]; then
    ENV_FLAGS+=(-e "GEMINI_API_KEY=${GEMINI_API_KEY}")
fi

echo "==> Starting Podman container '${CONTAINER_NAME}' on port ${PORT}..."
podman run -d \
    --name "${CONTAINER_NAME}" \
    -p "${PORT}:3000" \
    "${ENV_FLAGS[@]}" \
    "${IMAGE_NAME}"

echo "==> Container started successfully!"
echo "Access the app at: http://localhost:${PORT}"
echo "To view logs: podman logs -f ${CONTAINER_NAME}"
