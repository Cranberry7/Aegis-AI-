"""Application scripts."""

import subprocess


def run_pre_commit() -> None:
    """Run pre-commit on all files."""
    try:
        subprocess.run(["pre-commit", "run", "--all-files"], check=True)
    except subprocess.CalledProcessError:
        print("ERROR while running pre-commits.")


def ruff_check() -> None:
    """Run ruff linter on all files."""
    try:
        subprocess.run(["ruff", "check"], check=True)
    except subprocess.CalledProcessError:
        print("ERROR while running Ruff linter.")


def ruff_check_fix() -> None:
    """Run ruff linter on all files."""
    try:
        subprocess.run(["ruff", "check", "--fix"], check=True)
    except subprocess.CalledProcessError:
        print("ERROR while running Ruff linter fix.")


def run_celery() -> None:
    """Run celery app."""
    try:
        subprocess.run(
            ["celery", "-A", "app.modules.bg_process", "worker"],
            check=True,
        )
    except subprocess.CalledProcessError:
        print("ERROR while starting celery app.")


def run_celery_debug() -> None:
    """Run celery app."""
    try:
        subprocess.run(
            [
                "celery",
                "-A",
                "app.modules.bg_process",
                "worker",
                "--loglevel=debug",
            ],
            check=True,
        )
    except subprocess.CalledProcessError:
        print("ERROR while starting celery app in DEBUG mode.")


def quantize_reranker_model() -> None:
    """Quantize the reranker model."""
    try:
        subprocess.run(["python", "scripts/quantize_reranker_model.py"], check=True)
    except subprocess.CalledProcessError:
        print("ERROR while quantizing the reranker model.")
