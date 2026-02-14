import { Link, useNavigate } from "react-router-dom";
import answerData from "../../assets/answer.json";
import descriptionData from "../../assets/description.json";
import questionData from "../../assets/question.json";
import "./Result.css";

type AnswerChoice = {
  answer: string;
};

type QuestionItem = {
  id: number;
  q: string;
  a: AnswerChoice[];
};

type RawQuestion = {
  id: number;
  question: string;
  answers: AnswerChoice[];
};

type MemberAnswer = {
  "student number": string;
  name: string;
  answer: number[];
};

type MemberDescription = {
  name: string;
  desc: string;
};

type MemberImage = {
  studentNumber: string;
  name: string;
  src: string;
};

const STORAGE_KEY = "primitiveMbtiSelections";

const readStoredSelections = (): number[] => {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((item) => Number.isInteger(item));
  } catch {
    return [];
  }
};

const memberImages = import.meta.glob(
  "../../assets/members/*.{png,jpg,jpeg,webp}",
  {
    eager: true,
    import: "default",
  },
) as Record<string, string>;

const parsedImages: MemberImage[] = Object.entries(memberImages)
  .map(([path, src]) => {
    const fileName = path.split("/").pop() ?? "";
    const baseName = fileName.replace(/\.(png|jpe?g|webp)$/i, "");
    const [studentNumber, name] = baseName.split("_");

    if (!studentNumber || !name) {
      return null;
    }

    return { studentNumber, name, src };
  })
  .filter(Boolean) as MemberImage[];

const normalizeName = (value: string) => value.replace(/\s+/g, "").trim();

const extractBracketName = (value: string) => {
  const match = value.match(/\[([^\]]+)\]/);
  return match?.[1] ?? value;
};

const resolveDescription = (
  memberName: string,
  descriptions: MemberDescription[],
) => {
  const candidates = [memberName, memberName.slice(1)]
    .map((name) => normalizeName(name))
    .filter(Boolean);

  for (const item of descriptions) {
    const extracted = extractBracketName(item.name);
    const normalized = normalizeName(extracted);

    if (
      candidates.some(
        (candidate) =>
          normalized.includes(candidate) || candidate.includes(normalized),
      )
    ) {
      return item;
    }
  }

  return null;
};

const resolveImage = (member: MemberAnswer) => {
  const nameKey = normalizeName(member.name);

  const matchByName = parsedImages.find((image) =>
    normalizeName(image.name).includes(nameKey),
  );
  if (matchByName) {
    return matchByName.src;
  }

  const matchByNumber = parsedImages.find(
    (image) => image.studentNumber === member["student number"],
  );
  return matchByNumber?.src ?? "";
};

function Result() {
  const raw = (questionData.questions ?? []) as RawQuestion[];
  const questions: QuestionItem[] = raw.map((item) => ({
    id: item.id,
    q: item.question,
    a: item.answers,
  }));
  const selections = readStoredSelections().slice(0, questions.length);
  const normalizedSelections = selections.map((value) => value + 1);

  const members = (answerData.answer ?? []) as MemberAnswer[];
  const descriptions = (descriptionData.description ??
    []) as MemberDescription[];

  const rankedMembers = members
    .map((member) => {
      const score = member.answer.reduce((total, value, index) => {
        if (normalizedSelections[index] === value) {
          return total + 1;
        }
        return total;
      }, 0);

      return { member, score };
    })
    .sort((a, b) => b.score - a.score);

  const bestMatch = rankedMembers[0];
  const matchedDescription = bestMatch
    ? resolveDescription(bestMatch.member.name, descriptions)
    : null;
  const matchedImage = bestMatch ? resolveImage(bestMatch.member) : "";
  const descriptionLines = matchedDescription?.desc
    ? matchedDescription.desc
        .split("\n")
        .filter((line) => line.trim().length > 0)
    : [];

  if (!bestMatch || normalizedSelections.length === 0) {
    return (
      <section className="result-page">
        <div className="result-shell">
          <h1 className="result-title">RESULT</h1>
          <p className="result-desc">아직 선택한 답변이 없습니다.</p>
          <Link className="result-cta" to="/question">
            질문 시작하기
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="result-page">
      <div className="result-shell">
        <div className="result-header">
          <p className="result-eyebrow">당신의 결과는?!</p>
          <h1 className="result-title">
            {matchedDescription?.name ?? bestMatch.member.name}
          </h1>
        </div>

        <div className="result-profile">
          <div className="result-image" aria-hidden={!matchedImage}>
            {matchedImage ? (
              <img src={matchedImage} alt={`${bestMatch.member.name} 프로필`} />
            ) : (
              <div className="result-image__placeholder" />
            )}
          </div>
          <div className="result-summary">
            {descriptionLines.map((line, index) => (
              <p
                className={index === 0 ? "result-quote" : "result-desc"}
                key={`${bestMatch.member.name}-${index}`}
              >
                {line}
              </p>
            ))}
          </div>
        </div>

        <div className="result-footer">
          <div className="result-footer__content">
            <p className="result-similar">
              {matchedDescription?.name ?? bestMatch.member.name} 와(과) 비슷한
              타입인 당신!
            </p>
            <p className="result-cta-title">
              PRIMITIVE에 지원해보는 건 어떨까요?
            </p>

            <div className="result-actions">
              <a
                className="result-cta"
                href="https://forms.gle/8aDB9L7XTZRxrhDv6"
                target="_blank"
                rel="noreferrer"
              >
                PRIMITIVE 입부 신청하기
              </a>
              <a
                className="result-link"
                href="https://primitive.kr"
                target="_blank"
                rel="noreferrer"
              >
                PRIMITIVE가 더 궁금하다면?
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Result;
