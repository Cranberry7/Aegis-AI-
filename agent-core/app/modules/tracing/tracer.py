"""Langfuse tracing utilities."""

import base64
import os

from openinference.instrumentation.agno import AgnoInstrumentor
from openinference.instrumentation.google_genai import GoogleGenAIInstrumentor
from opentelemetry import trace as trace_api
from opentelemetry.exporter.otlp.proto.http.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import SimpleSpanProcessor

from app.config import settings


def init_tracer():
    """Initialize the tracer for Langfuse."""
    langfuse_auth = base64.b64encode(
        f"{settings.LANGFUSE_PUBLIC_KEY}:{settings.LANGFUSE_SECRET_KEY}".encode()
    ).decode()

    # Configure OpenTelemetry endpoint & headers to send data to Langfuse
    os.environ["OTEL_EXPORTER_OTLP_ENDPOINT"] = settings.LANGFUSE_HOST
    os.environ["OTEL_EXPORTER_OTLP_HEADERS"] = f"Authorization=Basic {langfuse_auth}"

    # Configure the tracer provider
    trace_provider = TracerProvider()
    trace_provider.add_span_processor(SimpleSpanProcessor(OTLPSpanExporter()))
    trace_api.set_tracer_provider(trace_provider)

    # Start instrumenting agno
    AgnoInstrumentor().instrument()
    # Instrument the underlying LLM library (e.g., Google Generative AI)
    GoogleGenAIInstrumentor().instrument()
