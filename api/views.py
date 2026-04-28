import json
import requests
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


def index(request):
    return render(request, 'chat.html')


@csrf_exempt
@require_http_methods(["POST"])
def send_message(request):
    try:
        payload = json.loads(request.body)
    except (json.JSONDecodeError, ValueError):
        return JsonResponse({"error": "Noto'g'ri JSON format."}, status=400)

    name = (payload.get("name") or "").strip()
    telegram = (payload.get("telegram") or "").strip()
    message = (payload.get("message") or "").strip()

    if not name or not telegram or not message:
        return JsonResponse(
            {"error": "Ism, xabar va Telegram username kiritilishi shart."},
            status=400,
        )

    token = settings.TELEGRAM_BOT_TOKEN
    chat_id = settings.TELEGRAM_CHAT_ID

    if not token or not chat_id:
        return JsonResponse(
            {"error": "Telegram sozlamalari topilmadi. .env faylni tekshiring."},
            status=500,
        )

    tg_link = f"\n👤 Telegram: https://t.me/{telegram.lstrip('@')}"
    text = (
        f"🚀 *Yangi xabar!*\n\n"
        f"📝 *Ism:* {name}\n"
        f"💬 *Xabar:* {message}"
        f"{tg_link}"
    )

    try:
        resp = requests.post(
            f"https://api.telegram.org/bot{token}/sendMessage",
            json={"chat_id": chat_id, "text": text, "parse_mode": "Markdown"},
            timeout=10,
        )
        resp.raise_for_status()
    except requests.RequestException as e:
        return JsonResponse({"error": f"Xabarni yuborib bo'lmadi: {str(e)}"}, status=500)

    return JsonResponse({"ok": True, "message": "Yuborildi"})
