import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import questionData from '../../assets/question.json'
import './Question.css'

type AnswerChoice = {
  answer: string
}

type RawQuestion = {
  id: number
  question: string
  answers: AnswerChoice[]
}

const STORAGE_KEY = 'primitiveMbtiSelections'

const readStoredSelections = (): number[] => {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed.filter((item) => Number.isInteger(item))
  } catch {
    return []
  }
}

const writeStoredSelections = (selections: number[]) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(selections))
}

function Question() {
  const navigate = useNavigate()
  const questions = useMemo(() => {
    const raw = (questionData.questions ?? []) as RawQuestion[]
    return raw.map((item) => ({
      id: item.id,
      q: item.question,
      a: item.answers,
    }))
  }, [])
  const totalQuestions = questions.length

  const initialSelections = useMemo(() => {
    const stored = readStoredSelections().slice(0, totalQuestions)
    if (stored.length === totalQuestions) {
      return []
    }

    return stored
  }, [totalQuestions])

  const [currentIndex, setCurrentIndex] = useState(initialSelections.length)
  const [selections, setSelections] = useState<number[]>(initialSelections)

  const currentQuestion = questions[currentIndex]
  const progressValue = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const handleAnswer = (answerIndex: number) => {
    const nextSelections = [...selections]
    nextSelections[currentIndex] = answerIndex
    setSelections(nextSelections)
    writeStoredSelections(nextSelections)

    if (currentIndex >= totalQuestions - 1) {
      navigate('/result')
      return
    }

    setCurrentIndex((prev) => Math.min(prev + 1, totalQuestions - 1))
  }

  if (!currentQuestion) {
    return (
      <section className="question-page">
        <div className="question-shell">
          <h1 className="question-title">QUESTION</h1>
          <p className="question-desc">질문을 불러올 수 없습니다.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="question-page">
      <div className="question-shell">
        <div className="question-progress" aria-hidden="true">
          <span className="question-progress__bar" style={{ width: `${progressValue}%` }} />
        </div>

        <div className="question-card">
          <span className="question-quote" aria-hidden="true">"</span>
          <p className="question-text">{currentQuestion.q}</p>
          <span className="question-quote" aria-hidden="true">"</span>
        </div>

        <div className="answer-list">
          {currentQuestion.a.map((choice, index) => (
            <button
              className="answer-button"
              type="button"
              key={`${currentQuestion.id}-${index}`}
              onClick={() => handleAnswer(index)}
            >
              {choice.answer}
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Question
