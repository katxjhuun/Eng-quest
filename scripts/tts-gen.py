# AI ses üretimi 2. adım: bir ses için Firebase'de olmayan metinlerin bu parçasını Kokoro ile üretir, prep/audio/<ses>/<anahtar> altına yükler.
# Kullanım: python tts-gen.py <ses> <parça_no> <parça_sayısı>. Metinler günlüğe yazılmaz.
import base64, json, os, sys, time
import numpy as np, lameenc
from google.oauth2 import service_account
from google.auth.transport.requests import AuthorizedSession
from kokoro_onnx import Kokoro

voice, part, parts = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
DB = os.environ['DB_URL'].rstrip('/')
cred = service_account.Credentials.from_service_account_info(json.loads(os.environ['FIREBASE_SERVICE_ACCOUNT']), scopes=['https://www.googleapis.com/auth/userinfo.email', 'https://www.googleapis.com/auth/firebase.database'])
s = AuthorizedSession(cred)
texts = json.load(open('/tmp/tts/texts.json'))
r = s.get(f'{DB}/prep/audio/{voice}.json', params={'shallow': 'true'}); r.raise_for_status()
have = set((r.json() or {}).keys())
todo = sorted(k for k in texts if k not in have)
mine = todo[part::parts]
print(f'{voice}: toplam {len(texts)}, hazır {len(have)}, eksik {len(todo)}, bu parça {len(mine)}', flush=True)
if not mine: sys.exit(0)
k = Kokoro('/tmp/model/kokoro-v1.0.onnx', '/tmp/model/voices-v1.0.bin')
lang = 'en-us' if voice[0] == 'a' else 'en-gb'
def mp3(samples, sr):
    e = lameenc.Encoder(); e.set_bit_rate(20); e.set_in_sample_rate(sr); e.set_channels(1); e.set_quality(2)
    return e.encode((np.clip(samples, -1, 1) * 32767).astype('<i2').tobytes()) + e.flush()
buf, done, size, t0, fail = {}, 0, 0, time.time(), 0
def flush():
    global buf
    if not buf: return
    for a in range(4):
        try:
            rr = s.patch(f'{DB}/prep/audio/{voice}.json', data=json.dumps(buf), timeout=120); rr.raise_for_status(); break
        except Exception as ex:
            print('yükleme tekrar', a + 1, type(ex).__name__, flush=True); time.sleep(5 * (a + 1))
    else: raise SystemExit('yükleme başarısız')
    buf = {}
for key in mine:
    try:
        samples, sr = k.create(texts[key], voice=voice, speed=1.0, lang=lang)
        b = base64.b64encode(mp3(samples, sr)).decode(); buf[key] = b; size += len(b)
    except Exception as ex:
        fail += 1; print('üretilemedi', key, type(ex).__name__, flush=True); continue
    done += 1
    if len(buf) >= 60: flush()
    if done % 200 == 0: print(f'{done}/{len(mine)} · {time.time() - t0:.0f} sn · ort. {size // max(done, 1)} B', flush=True)
flush()
print(f'bitti {done}/{len(mine)} · hata {fail} · {time.time() - t0:.0f} sn · {size / 1e6:.1f} MB', flush=True)
