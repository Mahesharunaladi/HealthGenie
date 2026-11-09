"""
Heuristic skin-rash analyzer for educational screening.

Uses color, texture, and lesion-shape cues from OpenCV. This is NOT a
clinical diagnosis and always returns a medical disclaimer.
"""

from __future__ import annotations

from typing import Any, Dict, List, Tuple

import cv2
import numpy as np


RASH_KNOWLEDGE: Dict[str, Dict[str, Any]] = {
    "hives_urticaria": {
        "label": "Hives (Urticaria)",
        "summary": "Raised, itchy, blotchy red welts that can appear and fade quickly.",
        "likely_causes": ["Allergy (food, medicine, insect)", "Viral infection", "Heat or stress"],
        "home_care": [
            "Avoid known triggers (new foods, soaps, medicines) until a doctor reviews them",
            "Apply a cool compress for 10 minutes",
            "Wear loose cotton clothing",
            "An over-the-counter antihistamine (cetirizine/loratadine) may help itch — follow the label or ask a pharmacist",
        ],
        "avoid": ["Hot showers", "Scratching", "Alcohol and spicy food if they worsen itch"],
        "see_doctor_if": [
            "Swelling of lips, tongue, or face",
            "Trouble breathing or swallowing",
            "Hives lasting more than 24–48 hours or spreading fast",
        ],
        "urgency": "yellow",
    },
    "eczema": {
        "label": "Eczema / Dry dermatitis",
        "summary": "Dry, itchy, scaly patches, often on folds of skin (elbows, knees, neck).",
        "likely_causes": ["Atopic eczema", "Dry skin", "Irritant soaps"],
        "home_care": [
            "Moisturize 2–3 times a day with a fragrance-free cream",
            "Short lukewarm baths, then apply moisturizer within 3 minutes",
            "Use a mild unscented cleanser",
            "Keep nails short to reduce scratch damage",
        ],
        "avoid": ["Harsh soaps", "Wool against the skin", "Very hot water"],
        "see_doctor_if": ["Oozing, yellow crust, or fever (possible infection)", "Sleep is badly affected"],
        "urgency": "green",
    },
    "contact_dermatitis": {
        "label": "Contact dermatitis",
        "summary": "Red, itchy irritation where skin touched an allergen or chemical.",
        "likely_causes": ["New soap, detergent, cosmetics", "Plants (e.g. nickel, perfume)", "Occupational chemicals"],
        "home_care": [
            "Wash the area with lukewarm water and a gentle cleanser",
            "Stop using any new cream, jewellery, or detergent",
            "Apply a bland moisturizer",
            "A 1% hydrocortisone cream (if available OTC) can be used for a few days on intact skin",
        ],
        "avoid": ["The suspected product", "Scratching until the skin breaks"],
        "see_doctor_if": ["Blisters, spreading rash, or involvement of eyes/genitals"],
        "urgency": "green",
    },
    "fungal_ringworm": {
        "label": "Fungal rash (ringworm-like)",
        "summary": "Round or ring-shaped patch with a clearer centre and scaly edge.",
        "likely_causes": ["Dermatophyte fungus", "Sweaty skin folds", "Shared towels/clothes"],
        "home_care": [
            "Keep the area clean and dry",
            "Use an antifungal cream (clotrimazole/terbinafine) twice daily for 2–4 weeks if available OTC",
            "Wash clothes, towels, and bedding separately in hot water",
            "Do not share towels or razors",
        ],
        "avoid": ["Steroid creams alone (they can worsen fungus)", "Tight synthetic clothes"],
        "see_doctor_if": ["Rash on scalp, nails, or groin that is not improving in 1–2 weeks"],
        "urgency": "green",
    },
    "heat_rash": {
        "label": "Heat rash (prickly heat)",
        "summary": "Tiny red bumps or clear blisters from blocked sweat glands in hot, humid weather.",
        "likely_causes": ["Heat and humidity", "Tight clothing", "Fever with sweating"],
        "home_care": [
            "Move to a cooler, ventilated place",
            "Wear loose cotton clothes",
            "Cool shower and pat dry — do not rub",
            "Calamine lotion can soothe itch",
        ],
        "avoid": ["Heavy ointments that trap sweat", "Intense exercise in heat until it settles"],
        "see_doctor_if": ["Fever with pus-filled bumps", "Infant with widespread rash and irritability"],
        "urgency": "green",
    },
    "acne_folliculitis": {
        "label": "Acne / inflamed follicles",
        "summary": "Small red or yellowish bumps, often on the face, chest, or back.",
        "likely_causes": ["Clogged pores", "Hormones", "Sweat and oil"],
        "home_care": [
            "Wash twice daily with a gentle cleanser",
            "Do not squeeze lesions",
            "Benzoyl peroxide or salicylic acid products can help mild acne",
        ],
        "avoid": ["Heavy oil-based creams", "Picking"],
        "see_doctor_if": ["Painful cysts, scarring, or sudden widespread pustules with fever"],
        "urgency": "green",
    },
    "psoriasis_like": {
        "label": "Psoriasis-like plaques",
        "summary": "Thick, dry plaques that may look silvery-white on top of redness.",
        "likely_causes": ["Immune-related skin condition", "Stress, infection, or skin injury as triggers"],
        "home_care": [
            "Moisturize generously",
            "Avoid scratching and harsh soaps",
            "Sunlight in small, safe amounts sometimes helps — never burn the skin",
        ],
        "avoid": ["Self-medicating with strong steroid creams for long periods"],
        "see_doctor_if": ["New thick plaques — a doctor should confirm the diagnosis"],
        "urgency": "yellow",
    },
    "insect_bite": {
        "label": "Insect bite or sting reaction",
        "summary": "A local red, itchy bump, sometimes with a central mark.",
        "likely_causes": ["Mosquito, ant, bed bug, or other insect"],
        "home_care": [
            "Wash with soap and water",
            "Cool compress",
            "Antihistamine for itch if needed",
            "Watch for spreading redness",
        ],
        "avoid": ["Scratching open", "Home remedies that burn the skin"],
        "see_doctor_if": ["Difficulty breathing", "Rapid swelling", "Fever, red streaks, or increasing pain (infection)"],
        "urgency": "yellow",
    },
    "cellulitis_alert": {
        "label": "Spreading infection (cellulitis-like) — urgent review",
        "summary": "Hot, tender, spreading redness that can be a bacterial skin infection.",
        "likely_causes": ["Bacterial infection after a cut, bite, or cracked skin"],
        "home_care": [
            "Do not delay medical care if the area is hot, painful, and spreading",
            "Keep the limb elevated if a limb is involved",
            "Do not puncture or squeeze",
        ],
        "avoid": ["Waiting at home if fever or red streaks appear"],
        "see_doctor_if": [
            "Fever, chills, or feeling very unwell",
            "Red streaks",
            "Rapid spread over hours",
        ],
        "urgency": "red",
    },
    "viral_exanthem": {
        "label": "Viral rash (measles/viral-exanthem pattern)",
        "summary": "Widespread small red spots, often with fever, cough, or cold symptoms.",
        "likely_causes": ["Viral illness", "Drug reaction (less common)"],
        "home_care": [
            "Rest, fluids, and fever care (paracetamol as labelled if fever)",
            "Isolate from infants, pregnant people, and immunocompromised contacts until a doctor advises",
        ],
        "avoid": ["Aspirin in children"],
        "see_doctor_if": [
            "High fever, difficulty breathing, confusion",
            "Rash that does not blanch (does not fade when pressed) — seek urgent care",
            "Pregnancy or a very young infant in the household",
        ],
        "urgency": "yellow",
    },
}


class RashAnalyzer:
    def analyze(self, image_path: str) -> Dict[str, Any]:
        image = cv2.imread(image_path)
        if image is None:
            raise ValueError("Could not read the uploaded image. Please try a clearer photo.")

        image = cv2.resize(image, (320, 320))
        hsv = cv2.cvtColor(image, cv2.COLOR_BGR2HSV)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)

        redness = self._redness_ratio(hsv)
        texture = self._texture_score(gray)
        circularity = self._circularity_score(gray)
        white_scale = self._white_scale_ratio(lab)
        small_spots = self._small_spot_density(hsv)
        heat_spread = redness * (1.0 - circularity)

        scores: Dict[str, float] = {
            "hives_urticaria": 0.25 * redness + 0.15 * (1 - texture) + 0.2 * heat_spread + 0.1,
            "eczema": 0.2 * redness + 0.45 * texture + 0.15 * white_scale,
            "contact_dermatitis": 0.4 * redness + 0.2 * (1 - circularity) + 0.1 * texture,
            "fungal_ringworm": 0.55 * circularity + 0.2 * texture + 0.1 * redness,
            "heat_rash": 0.5 * small_spots + 0.25 * redness + 0.1 * (1 - white_scale),
            "acne_folliculitis": 0.4 * small_spots + 0.2 * redness + 0.15 * texture,
            "psoriasis_like": 0.45 * white_scale + 0.3 * texture + 0.1 * redness,
            "insect_bite": 0.25 * redness + 0.35 * (1 - small_spots) + 0.15 * (1 - circularity),
            "cellulitis_alert": 0.55 * redness + 0.2 * heat_spread - 0.2 * circularity,
            "viral_exanthem": 0.4 * small_spots + 0.35 * redness + 0.1 * (1 - white_scale),
        }

        ranked = sorted(scores.items(), key=lambda item: item[1], reverse=True)
        top = ranked[:3]
        total = sum(max(score, 0.05) for _, score in top) or 1.0

        findings: List[Dict[str, Any]] = []
        for key, score in top:
            info = RASH_KNOWLEDGE[key]
            confidence = round(min(0.92, max(0.28, (max(score, 0.05) / total) * 0.85 + 0.1)), 2)
            findings.append(
                {
                    "condition_key": key,
                    "condition": info["label"],
                    "confidence": confidence,
                    "summary": info["summary"],
                    "likely_causes": info["likely_causes"],
                    "home_care": info["home_care"],
                    "avoid": info["avoid"],
                    "see_doctor_if": info["see_doctor_if"],
                    "urgency": info["urgency"],
                }
            )

        primary = findings[0]
        image_quality = self._quality_notes(gray, redness)

        spoken = self._spoken_summary(primary, findings)

        return {
            "primary_condition": primary["condition"],
            "urgency": primary["urgency"],
            "confidence": primary["confidence"],
            "image_cues": {
                "redness_index": round(redness, 3),
                "texture_index": round(texture, 3),
                "ring_pattern": round(circularity, 3),
                "scale_index": round(white_scale, 3),
                "spot_density": round(small_spots, 3),
            },
            "quality_notes": image_quality,
            "findings": findings,
            "care_plan": {
                "do_now": primary["home_care"][:3],
                "avoid": primary["avoid"],
                "red_flags": primary["see_doctor_if"],
            },
            "spoken_summary": spoken,
            "disclaimer": (
                "This is an AI screening from a photo, not a medical diagnosis. "
                "Lighting, camera quality, and similar-looking rashes can confuse the model. "
                "See a doctor or dermatologist for confirmation, especially if there is fever, "
                "rapid spread, pain, pus, or breathing difficulty."
            ),
        }

    def _redness_ratio(self, hsv: np.ndarray) -> float:
        lower1 = np.array([0, 40, 40])
        upper1 = np.array([12, 255, 255])
        lower2 = np.array([160, 40, 40])
        upper2 = np.array([180, 255, 255])
        mask = cv2.bitwise_or(cv2.inRange(hsv, lower1, upper1), cv2.inRange(hsv, lower2, upper2))
        return float(np.mean(mask > 0))

    def _texture_score(self, gray: np.ndarray) -> float:
        lap = cv2.Laplacian(gray, cv2.CV_64F).var()
        return float(min(1.0, lap / 800.0))

    def _circularity_score(self, gray: np.ndarray) -> float:
        blur = cv2.GaussianBlur(gray, (5, 5), 0)
        edges = cv2.Canny(blur, 40, 120)
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not contours:
            return 0.1
        best = 0.0
        for contour in contours:
            area = cv2.contourArea(contour)
            if area < 80:
                continue
            peri = cv2.arcLength(contour, True)
            if peri == 0:
                continue
            circ = 4 * np.pi * area / (peri * peri)
            best = max(best, min(1.0, circ))
        return float(best)

    def _white_scale_ratio(self, lab: np.ndarray) -> float:
        l_channel = lab[:, :, 0]
        return float(np.mean(l_channel > 180))

    def _small_spot_density(self, hsv: np.ndarray) -> float:
        mask = cv2.inRange(hsv, np.array([0, 50, 50]), np.array([20, 255, 255]))
        mask = cv2.medianBlur(mask, 5)
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        small = [c for c in contours if 8 < cv2.contourArea(c) < 400]
        return float(min(1.0, len(small) / 80.0))

    def _quality_notes(self, gray: np.ndarray, redness: float) -> List[str]:
        notes: List[str] = []
        if gray.mean() < 50:
            notes.append("Photo looks dark — retake near a window for a clearer reading.")
        if gray.mean() > 210:
            notes.append("Photo looks overexposed — avoid flash glare on the skin.")
        if redness < 0.04:
            notes.append("Little redness was detected. Make sure the rash fills most of the frame.")
        if cv2.Laplacian(gray, cv2.CV_64F).var() < 40:
            notes.append("Image looks blurry — hold the camera steady and closer to the skin.")
        if not notes:
            notes.append("Image quality looks usable for a screening estimate.")
        return notes

    def _spoken_summary(self, primary: Dict[str, Any], findings: List[Dict[str, Any]]) -> str:
        alts = ", ".join(item["condition"] for item in findings[1:])
        flags = "; ".join(primary["see_doctor_if"][:2])
        return (
            f"From the photo, the most likely pattern is {primary['condition']}. "
            f"{primary['summary']} "
            f"Other possible looks include {alts}. "
            f"Start with this care: {primary['home_care'][0]}. "
            f"See a doctor quickly if {flags}. "
            "This is only a screening, not a diagnosis."
        )


rash_analyzer = RashAnalyzer()
