#!/bin/bash

echo "Checking for Poetry installation..."
if command -v poetry &> /dev/null; then
    echo "Deleting existing virtual environment..."
    rm -rf .venv
    echo "Poetry is already installed. Removing existing installation..."
    curl -sSL https://install.python-poetry.org | python3 - --uninstall
    sudo apt purge python3-poetry -y
    echo "Poetry has been removed."
else
    echo "Poetry is not installed. Proceeding with fresh setup..."
fi



echo "Cleaning up Git hooks..."
rm -rf .git/hooks

echo "Installing Poetry..."
curl -sSL https://install.python-poetry.org | python3 -
export PATH="$PATH:$HOME/.local/bin"

poetry --version

echo "Initializing Poetry"
poetry config --local virtualenvs.in-project true

poetry install --no-cache

echo "Activating environment..."
sleep 2
source .venv/bin/activate

echo "Setup complete. Virtual environment is ready!"

echo "Setting up pre-commits..."
pre-commit install --hook-type pre-commit --hook-type pre-push
echo "Pre-commits setup complete."

echo "Quantizing reranker model..."
poetry run run:quantize-reranker
echo "Saved quantized reranker model."
