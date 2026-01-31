"""Script to quantize the reranker model."""

import os

import torch
from onnxruntime.quantization import QuantType, quantize_dynamic
from transformers import AutoModelForSequenceClassification, AutoTokenizer

from app.config import settings

RERANKER_MODEL = settings.RERANKER_MODEL
RERANKER_ONNX_PATH = settings.RERANKER_ONNX_PATH

MODEL_NAME = "cross-encoder/ms-marco-MiniLM-L-4-v2"
onnx_model_path = "./models/minilm-l4-crossencoder.onnx"

if not os.path.exists("./models"):
    os.makedirs("./models")
    print("Created models directory")

# Load model
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
model = AutoModelForSequenceClassification.from_pretrained(MODEL_NAME)
model.eval()

# Dummy input for tracing
inputs = tokenizer(
    "query", "passage", return_tensors="pt", padding=True, truncation=True
)

# Export to ONNX
torch.onnx.export(
    model,
    (inputs["input_ids"], inputs["attention_mask"], inputs["token_type_ids"]),
    onnx_model_path,
    input_names=["input_ids", "attention_mask", "token_type_ids"],
    output_names=["logits"],
    dynamic_axes={
        "input_ids": {0: "batch_size", 1: "seq_len"},
        "attention_mask": {0: "batch_size", 1: "seq_len"},
        "token_type_ids": {0: "batch_size", 1: "seq_len"},
        "logits": {0: "batch_size"},
    },
    opset_version=14,
)

print(f"ONNX model saved to {onnx_model_path}")


quantized_model_path = RERANKER_ONNX_PATH

quantize_dynamic(
    onnx_model_path,
    quantized_model_path,
    weight_type=QuantType.QInt8,  # or QuantType.QUInt8
)

print(f"Quantized model saved to {quantized_model_path}")
