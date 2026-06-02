"""
Question data class. Vendored from jee_mains_pyqs_data_base v007.
"""


class Question:
    """Loads data from database into inherited class variables"""

    def __repr__(self) -> str:
        template = f"""
QuestionId: {self.question_id}
Exam: {self.exam}
Year: {self.year}
Subject: {self.subject}
Chapter: {self.chapter}
"""
        return template

    def __init__(self, question_json: dict, embedding_model: str = "all-MiniLM-L6-v2") -> None:
        """Initialization of Question
        :param:
        question_json: json part of question
        embedding_model: ignored (embeddings not used by this vendored subset)
        """
        self.question_id = question_json.get("question_id", "")
        self.examGroup = question_json.get("examGroup", "")
        self.exam = question_json.get("exam", "")
        self.subject = question_json.get("subject", "")
        self.chpaterGroup = question_json.get("chapterGroup", "")
        self.chapter = question_json.get("chapter", "")
        self.year = question_json.get("year", 0)
        self.paperTitle = question_json.get("paperTitle", "")
        self.difficulty = question_json.get("difficulty", "")
        self.topic = question_json.get("topic", "")
        self.type = question_json.get("type", "")
        self.examDate = question_json.get("examDate", None)
        self.answer = question_json.get("answer", None)
        question_en = question_json.get("question", {}).get("en", {})
        self.question = question_en.get("content", "")
        self.options = question_en.get("options", [])
        self.correct_options = question_en.get("correct_options", [])
        self.explanation = question_en.get("explanation", "")

        self.isOutOfSyllabus = question_json.get("isOutOfSyllabus", False)
        self.isBonus = question_json.get("isBonus", False)

        self.isImgQuestion = self.check_image_in_text(self.question)
        self.isImgExplanation = self.check_image_in_text(self.explanation)
        self.isImgOption = self.check_image_in_options()

    def check_image_in_text(self, text: str) -> bool:
        text_s = text.split("<img")
        return len(text_s) != 1

    def check_image_in_options(self) -> bool:
        options_json = self.options
        if not isinstance(options_json, list):
            return False
        return [
            "img" in str(opt.get("content", "")).lower() if isinstance(opt, dict) else False
            for opt in options_json
        ]
