from datetime import date
from io import BytesIO
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont

from app.schemas.stats import WeeklyReportResponse


def build_weekly_report_image(report: WeeklyReportResponse) -> bytes:
    width, height = 800, 420
    img = Image.new("RGB", (width, height), color="#0d1b2a")
    draw = ImageDraw.Draw(img)

    try:
        font_big = ImageFont.truetype("DejaVuSans-Bold.ttf", 26)
        font_small = ImageFont.truetype("DejaVuSans.ttf", 18)
    except OSError:
        font_big = ImageFont.load_default()
        font_small = ImageFont.load_default()

    draw.text((20, 20), "Pet Time Tracker", fill="white", font=font_big)
    draw.text(
        (20, 60),
        f"Week: {report.start} - {report.end}",
        fill="#a1c6ea",
        font=font_small,
    )

    y = 110
    total_walk = sum(d.walk_min for d in report.days)
    total_play = sum(d.play_min for d in report.days)
    total_treat = sum(d.treat_count for d in report.days)
    streak_best = max((d.streak_info or 0) for d in report.days)
    change_pct = report.days[0].change_vs_last_week

    summary_lines = [
        f"Walk: {total_walk:.0f} min",
        f"Play: {total_play:.0f} min",
        f"Treats: {total_treat:.0f} times",
        f"Streak best: {streak_best} days",
    ]
    if change_pct is not None:
        arrow = "↑" if change_pct >= 0 else "↓"
        summary_lines.append(f"Vs last week: {arrow}{abs(change_pct)*100:.1f}%")

    for line in summary_lines:
        draw.text((20, y), line, fill="white", font=font_small)
        y += 28

    bar_origin = (400, 140)
    bar_width = 320
    max_min = max(total_walk + total_play, 1)
    for idx, label, value in [
        (0, "Walk", total_walk),
        (1, "Play", total_play),
        (2, "Treat", total_treat),
    ]:
        bar_len = int((value / max_min) * bar_width)
        y_pos = bar_origin[1] + idx * 60
        draw.rectangle(
            [
                (bar_origin[0], y_pos),
                (bar_origin[0] + bar_len, y_pos + 30),
            ],
            fill="#1b9aaa",
        )
        draw.text((bar_origin[0] + bar_len + 10, y_pos), f"{label}: {value:.0f}", fill="white", font=font_small)

    draw.text((20, height - 40), "#PetTime", fill="#a1c6ea", font=font_small)

    buffer = BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()
