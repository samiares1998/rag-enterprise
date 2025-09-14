# services/mappers/food_mapper.py
import re

def map_food_chunks(results: list):
    mapped = []
    for r in results:
        text = r["chunk"]

        # ejemplo: parsear por regex (fastfood dataset estilo tabla)
        match = re.match(r".*Mcdonalds\s+(.*?)\s+(\d+)", text)
        if match:
            mapped.append({
                "restaurant": "McDonald's",
                "product": match.group(1).strip(),
                "calories": int(match.group(2)),
                "source": r["metadata"]["source"]
            })
    return mapped
