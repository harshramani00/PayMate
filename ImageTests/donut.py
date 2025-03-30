from transformers import DonutProcessor, VisionEncoderDecoderModel
from PIL import Image
import torch

# Load the Donut processor and pretrained model
processor = DonutProcessor.from_pretrained("naver-clova-ix/donut-base-finetuned-docvqa")
model = VisionEncoderDecoderModel.from_pretrained("naver-clova-ix/donut-base-finetuned-docvqa")

# Load and preprocess your receipt image
image = Image.open("C:/PayMate/PayMate/ImageTests/data/receipt 2.jpg").convert("RGB")

# Prepare the image and prompt
pixel_values = processor(image, return_tensors="pt").pixel_values
task_prompt = "<s_docvqa><s_question>What is the content of the receipt?</s_question><s_answer>"

# Run inference
outputs = model.generate(
    pixel_values,
    decoder_input_ids=processor.tokenizer(task_prompt, add_special_tokens=False, return_tensors="pt").input_ids,
    max_length=512,
    early_stopping=True,
)

# Decode the output
decoded_output = processor.batch_decode(outputs, skip_special_tokens=True)[0]
print("Extracted Receipt Text:\n", decoded_output)
