"""
Guided home-care clinic for common cold / cough and first-aid cards.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional


COLD_COUGH_STEPS: List[Dict[str, Any]] = [
    {
        "id": "age_group",
        "question": "Who is this for?",
        "spoken": "Who needs help today? An adult, a teenager, a child, or a baby under one year?",
        "options": [
            {"id": "adult", "label": "Adult (18+)"},
            {"id": "teen", "label": "Teen (13–17)"},
            {"id": "child", "label": "Child (1–12)"},
            {"id": "infant", "label": "Baby under 1 year"},
        ],
    },
    {
        "id": "duration",
        "question": "How long have the cold or cough symptoms been present?",
        "spoken": "How many days have the symptoms been there?",
        "options": [
            {"id": "d1", "label": "Less than 2 days"},
            {"id": "d3", "label": "2 to 5 days"},
            {"id": "d7", "label": "About a week"},
            {"id": "d14", "label": "More than 10 days"},
        ],
    },
    {
        "id": "fever",
        "question": "Is there a fever?",
        "spoken": "Is there fever, and how high does it feel?",
        "options": [
            {"id": "none", "label": "No fever"},
            {"id": "low", "label": "Mild (under 38.5°C / 101.3°F)"},
            {"id": "high", "label": "High (38.5°C / 101.3°F or more)"},
            {"id": "unknown", "label": "Not measured, feels warm"},
        ],
    },
    {
        "id": "cough_type",
        "question": "What is the cough like?",
        "spoken": "Is the cough dry, or is there mucus?",
        "options": [
            {"id": "dry", "label": "Dry / tickly"},
            {"id": "wet", "label": "Wet with mucus"},
            {"id": "whoop", "label": "Barking or whooping"},
            {"id": "none", "label": "Mostly blocked/runny nose, little cough"},
        ],
    },
    {
        "id": "associated",
        "question": "Which of these are also present?",
        "spoken": "Besides cough or cold, what else is happening?",
        "multi": True,
        "options": [
            {"id": "runny", "label": "Runny or blocked nose"},
            {"id": "throat", "label": "Sore throat"},
            {"id": "ache", "label": "Body ache / headache"},
            {"id": "sneeze", "label": "Sneezing"},
            {"id": "loss_smell", "label": "Loss of smell or taste"},
            {"id": "ear", "label": "Ear pain"},
            {"id": "none", "label": "None of these"},
        ],
    },
    {
        "id": "red_flags",
        "question": "Any of these warning signs?",
        "spoken": "This is important. Is there breathing trouble, chest pain, coughing blood, confusion, or a stiff neck?",
        "multi": True,
        "options": [
            {"id": "breathless", "label": "Shortness of breath or noisy breathing"},
            {"id": "chest", "label": "Chest pain or tightness"},
            {"id": "blood", "label": "Coughing blood"},
            {"id": "drowsy", "label": "Very drowsy, confused, or blue lips"},
            {"id": "neck", "label": "Severe headache / stiff neck / rash that does not fade"},
            {"id": "none", "label": "No warning signs"},
        ],
    },
    {
        "id": "history",
        "question": "Any of these health conditions?",
        "spoken": "Do you have asthma, diabetes, heart or lung disease, pregnancy, or a weak immune system?",
        "multi": True,
        "options": [
            {"id": "asthma", "label": "Asthma / COPD"},
            {"id": "heart", "label": "Heart disease"},
            {"id": "diabetes", "label": "Diabetes"},
            {"id": "immune", "label": "Weakened immune system"},
            {"id": "pregnant", "label": "Pregnancy"},
            {"id": "none", "label": "None of these"},
        ],
    },
]


FIRST_AID: List[Dict[str, Any]] = [
    {
        "id": "choking",
        "title": "Choking",
        "urgency": "red",
        "steps": [
            "If the person can cough or speak, encourage coughing.",
            "If they cannot breathe: call emergency services.",
            "Give 5 back blows between the shoulder blades, then 5 abdominal thrusts (Heimlich) in adults.",
            "Repeat until the object comes out or help arrives.",
        ],
    },
    {
        "id": "bleeding",
        "title": "Bleeding cut",
        "urgency": "yellow",
        "steps": [
            "Apply firm pressure with a clean cloth for 10 minutes.",
            "Elevate the limb if possible.",
            "Wash with clean water after bleeding slows; apply a clean dressing.",
            "Seek care for deep, dirty, or continuously bleeding wounds, or if tetanus shots are not up to date.",
        ],
    },
    {
        "id": "burn",
        "title": "Minor burn",
        "urgency": "yellow",
        "steps": [
            "Cool under running water for 20 minutes.",
            "Remove tight jewellery near the burn if it comes off easily.",
            "Cover loosely with clean, non-fluffy cloth.",
            "Do not apply toothpaste, oil, or ice. See a doctor for large, deep, facial, or chemical burns.",
        ],
    },
    {
        "id": "faint",
        "title": "Fainting",
        "urgency": "yellow",
        "steps": [
            "Lay the person flat and raise the legs.",
            "Loosen tight clothing and keep the airway clear.",
            "If they do not wake in 1 minute, or have chest pain, call emergency services.",
        ],
    },
    {
        "id": "fever_seizure",
        "title": "High fever at home",
        "urgency": "yellow",
        "steps": [
            "Light clothing, extra fluids, rest.",
            "Paracetamol as per age/weight on the pack — never exceed the labelled dose.",
            "Do not give aspirin to children.",
            "Urgent care if a baby under 3 months has fever, or anyone has a stiff neck, rash, or is very drowsy.",
        ],
    },
]


def start_cold_cough() -> Dict[str, Any]:
    step = COLD_COUGH_STEPS[0]
    return {
        "protocol": "cold_cough",
        "step_index": 0,
        "total_steps": len(COLD_COUGH_STEPS),
        "complete": False,
        "question": step["question"],
        "spoken": step["spoken"],
        "options": step["options"],
        "multi": step.get("multi", False),
        "step_id": step["id"],
        "answers": {},
        "assistant_message": (
            "I can walk you through a common cold and cough check. "
            "This is home-care guidance only — not a prescription or diagnosis.\n\n"
            f"**Question 1 of {len(COLD_COUGH_STEPS)}:** {step['question']}"
        ),
    }


def apply_cold_cough_answer(state: Dict[str, Any], selected: List[str]) -> Dict[str, Any]:
    step_index = int(state.get("step_index", 0))
    answers = dict(state.get("answers") or {})
    if step_index < 0 or step_index >= len(COLD_COUGH_STEPS):
        return build_cold_cough_plan(answers)

    step = COLD_COUGH_STEPS[step_index]
    answers[step["id"]] = selected
    next_index = step_index + 1

    if next_index >= len(COLD_COUGH_STEPS):
        plan = build_cold_cough_plan(answers)
        plan["answers"] = answers
        return plan

    nxt = COLD_COUGH_STEPS[next_index]
    return {
        "protocol": "cold_cough",
        "step_index": next_index,
        "total_steps": len(COLD_COUGH_STEPS),
        "complete": False,
        "question": nxt["question"],
        "spoken": nxt["spoken"],
        "options": nxt["options"],
        "multi": nxt.get("multi", False),
        "step_id": nxt["id"],
        "answers": answers,
        "assistant_message": (
            f"Got it.\n\n**Question {next_index + 1} of {len(COLD_COUGH_STEPS)}:** {nxt['question']}"
        ),
    }


def build_cold_cough_plan(answers: Dict[str, List[str]]) -> Dict[str, Any]:
    flags = set(answers.get("red_flags") or [])
    history = set(answers.get("history") or [])
    age = (answers.get("age_group") or ["adult"])[0]
    fever = (answers.get("fever") or ["none"])[0]
    cough = (answers.get("cough_type") or ["dry"])[0]
    duration = (answers.get("duration") or ["d3"])[0]
    associated = set(answers.get("associated") or [])

    emergency_flags = flags - {"none"}
    high_risk = bool((history - {"none"}) or age == "infant")

    if emergency_flags:
        urgency = "red"
        likely = "Possible serious illness — do not manage this at home alone"
        title = "Seek urgent medical care now"
    elif high_risk and (fever in {"high", "unknown"} or duration == "d14"):
        urgency = "yellow"
        likely = "Cold/flu-like illness in a higher-risk person"
        title = "Home care with same-day clinician advice"
    elif duration == "d14" or cough == "whoop":
        urgency = "yellow"
        likely = "Prolonged cough or croup/whoop pattern — needs a clinician review"
        title = "Likely lingering respiratory infection"
    elif fever == "high" and cough == "wet":
        urgency = "yellow"
        likely = "Flu-like or chesty cough — watch closely"
        title = "Influenza-like / chesty cough pattern"
    else:
        urgency = "green"
        likely = "Common viral cold (upper respiratory infection)"
        title = "Typical common cold / viral cough"

    do_now = [
        "Rest and sleep extra hours",
        "Drink water, soups, or oral rehydration — small sips often",
        "Saline nose drops or steam from a warm shower for blocked nose",
        "Honey in warm water for cough in people older than 1 year (never honey for infants)",
        "Paracetamol/acetaminophen for fever or body ache — follow the pack by age and weight",
    ]
    if cough == "wet":
        do_now.append("Sit upright and sip warm fluids to loosen mucus. A humidifier can help.")
    if "throat" in associated:
        do_now.append("Warm salt-water gargles (half a teaspoon salt in a cup of warm water) 2–3 times a day for adults and older children.")

    avoid = [
        "Antibiotics unless a doctor prescribes them — most colds are viral",
        "Aspirin in children and teens",
        "Cough syrups in children under 6 unless a doctor advises",
        "Smoking, vaping, and cold dry air on the throat",
    ]

    red_flags = [
        "Breathing faster than usual, chest pulling in, or blue lips",
        "Chest pain, coughing blood, or confusion",
        "Fever lasting more than 3 days, or symptoms getting worse after day 5",
        "Baby under 3 months with fever",
        "Unable to drink, very sleepy, or a non-blanching rash",
    ]

    otc = [
        {
            "name": "Paracetamol (acetaminophen)",
            "use": "Fever and body ache",
            "note": "Stay within the labelled daily maximum. Avoid if the person has significant liver disease unless a doctor agrees.",
        },
        {
            "name": "Saline nasal spray / drops",
            "use": "Blocked nose",
            "note": "Safe at most ages. For babies, use saline then gentle suction.",
        },
        {
            "name": "Antihistamine (cetirizine) — if lots of sneezing/itch",
            "use": "Allergy-like runny nose",
            "note": "Can cause drowsiness in some people. Ask a pharmacist in pregnancy or for young children.",
        },
    ]

    recovery = "Most viral colds improve in 3–7 days; cough can linger 2–3 weeks."
    if duration == "d14":
        recovery = "A cough beyond 10 days should be reviewed, especially with fever or breathlessness."

    if age == "infant":
        do_now = [
            "Keep the baby upright after feeds and offer smaller, more frequent feeds",
            "Saline drops and gentle nasal suction before feeds",
            "Do not give honey, cold syrups, or adult medicines",
            "See a doctor the same day for any baby under 3 months with fever or poor feeding",
        ]

    spoken = (
        f"{title}. This looks like {likely}. "
        f"Urgency level is {urgency}. "
        f"{do_now[0]}. {do_now[1]}. "
        "Call emergency services if there is trouble breathing, blue lips, chest pain, or unusual sleepiness. "
        "This is general home-care information, not a prescription."
    )

    message_lines = [
        f"**{title}**",
        f"Likely pattern: {likely}",
        f"Urgency: {urgency.upper()}",
        "",
        "**Care plan**",
        *[f"- {item}" for item in do_now],
        "",
        "**Avoid**",
        *[f"- {item}" for item in avoid],
        "",
        "**See a doctor or emergency care if**",
        *[f"- {item}" for item in red_flags],
        "",
        f"**Recovery:** {recovery}",
        "",
        "I am not a doctor and I cannot prescribe medicines. A pharmacist or clinician should confirm any tablet, dose, or syrup — especially for children, pregnancy, and chronic illness.",
    ]

    if emergency_flags:
        message_lines.insert(
            3,
            "🚨 Warning signs were selected. Please contact emergency services or the nearest hospital now.",
        )

    return {
        "protocol": "cold_cough",
        "complete": True,
        "step_index": len(COLD_COUGH_STEPS),
        "total_steps": len(COLD_COUGH_STEPS),
        "answers": answers,
        "urgency": urgency,
        "likely_condition": likely,
        "title": title,
        "care_plan": {
            "do_now": do_now,
            "avoid": avoid,
            "red_flags": red_flags,
            "otc_options": otc,
            "recovery": recovery,
        },
        "spoken": spoken,
        "assistant_message": "\n".join(message_lines),
    }


def detect_intent(message: str) -> Optional[str]:
    text = message.lower()
    rash_words = ("rash", "rashes", "itchy skin", "skin allergy", "eczema", "hives", "ringworm")
    cold_words = ("cold", "cough", "flu", "sore throat", "runny nose", "sneezing", "congestion")
    first_aid_words = ("first aid", "bleeding", "burn", "choking", "fainted", "fainting")
    if any(word in text for word in rash_words):
        return "rash"
    if any(word in text for word in first_aid_words):
        return "first_aid"
    if any(word in text for word in cold_words):
        return "cold_cough"
    return None
