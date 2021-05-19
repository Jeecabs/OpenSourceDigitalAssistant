
from parallel_wavegan.utils import load_model
from parallel_wavegan.utils import download_pretrained_model
from espnet2.bin.tts_inference import Text2Speech
from espnet_model_zoo.downloader import ModelDownloader
import torch
import time
from torch._C import device
import wavio
import sys

print('Number of arguments:', len(sys.argv), 'arguments.')
print('Argument List:', str(sys.argv))

if len(sys.argv) != 3:
    exit()

fs, lang = 22050, "English"

tag = "kan-bayashi/ljspeech_conformer_fastspeech2"

vocoder_tag = "ljspeech_multi_band_melgan.v2"

d = ModelDownloader()
# (BELOW PARAM) device="cuda" If GPU present
text2speech = Text2Speech(
    **d.download_and_unpack(tag),
    device="cpu",
    # Only for Tacotron 2
    threshold=0.5,
    minlenratio=0.0,
    maxlenratio=10.0,
    use_att_constraint=False,
    backward_window=1,
    forward_window=3,
    # Only for FastSpeech & FastSpeech2
    speed_control_alpha=1.0,
)
# TODO TEST THIS OUT text2speech.spc2wav = None  # Disable griffin-lim


# NOTE: Sometimes download is failed due to "Permission denied". That is
#   the limitation of google drive. Please retry after serveral hours.
vocoder = load_model(download_pretrained_model(vocoder_tag)).eval()
vocoder.remove_weight_norm()

# decide the input sentence by yourself
x = sys.argv[1]

# synthesis
with torch.no_grad():
    start = time.time()
    wav, c, *_ = text2speech(x)
    wav = vocoder.inference(c)
rtf = (time.time() - start) / (len(wav) / fs)
print(f"RTF = {rtf:5f}")

# let us listen to generated samples
wavio.write(sys.argv[2], wav.view(-1).numpy(), fs, sampwidth=4)
