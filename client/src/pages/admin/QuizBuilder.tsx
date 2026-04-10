import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trash2, ArrowLeft, Save, Send, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import apiClient from '../../api/apiClient';
import { cn } from '../../utils/cn';
import type { QuizDifficulty, QuestionType } from '../../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface QuestionFormValues {
  type: QuestionType;
  prompt: string;
  options: string[];
  correctOptionIndex: number;
  points: number;
  order: number;
}

interface QuizFormValues {
  title: string;
  description: string;
  category: string;
  difficulty: QuizDifficulty;
  timerSeconds: number;
  questions: QuestionFormValues[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_QUESTION: QuestionFormValues = {
  type: 'mcq',
  prompt: '',
  options: ['', '', '', ''],
  correctOptionIndex: 0,
  points: 10,
  order: 0,
};

const DEFAULT_FORM_VALUES: QuizFormValues = {
  title: '',
  description: '',
  category: '',
  difficulty: 'medium',
  timerSeconds: 30,
  questions: [{ ...DEFAULT_QUESTION }],
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function QuizBuilder() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const isEditing = !!quizId;

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, control, handleSubmit, reset, watch } = useForm<QuizFormValues>({
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  // Load quiz data when editing
  useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: QuizFormValues }>(`/quizzes/${quizId}`);
      reset(res.data.data);
      return res.data.data;
    },
    enabled: isEditing,
  });

  const onSaveDraft = async (data: QuizFormValues) => {
    setSaving(true);
    setErrorMsg('');
    try {
      if (isEditing) {
        await apiClient.patch(`/quizzes/${quizId}`, data);
      } else {
        const res = await apiClient.post<{ data: { _id: string } }>('/quizzes', data);
        navigate(`/admin/quizzes/${res.data.data._id}/edit`, { replace: true });
      }
    } catch {
      setErrorMsg('Failed to save quiz. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const onPublish = async () => {
    if (!isEditing) {
      setErrorMsg('Please save the quiz as a draft first before publishing.');
      return;
    }
    setPublishing(true);
    setErrorMsg('');
    try {
      await apiClient.patch(`/quizzes/${quizId}/publish`);
      navigate('/admin/dashboard');
    } catch {
      setErrorMsg('Failed to publish quiz. Please try again.');
    } finally {
      setPublishing(false);
    }
  };

  const addQuestion = () =>
    append({ ...DEFAULT_QUESTION, order: fields.length });

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-slide-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Link
            to="/admin/dashboard"
            aria-label="Back to dashboard"
            className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--muted)] hover:text-[var(--purple)] transition-colors border-2 border-transparent hover:border-[var(--purple-l)]"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">
              Quiz Studio
            </p>
            <h1 className="text-3xl font-heading text-[var(--text)]">
              {isEditing ? 'Masterpiece Editor' : 'Craft New Quiz'}
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSubmit(onSaveDraft)}
            disabled={saving}
            className="btn bg-white border-2 border-[var(--purple)] text-[var(--purple)] hover:bg-[var(--purple-l)] px-6 py-3 font-black text-sm gap-2"
          >
            <Save size={18} aria-hidden="true" />
            {saving ? 'Drafting…' : 'Save Draft'}
          </button>
          {isEditing && (
            <button
              onClick={onPublish}
              disabled={publishing}
              className="btn btn-p px-8 py-3 text-sm gap-2 shadow-[0_10px_20px_rgba(155,93,229,0.2)]"
            >
              <Send size={18} aria-hidden="true" />
              {publishing ? 'Launching…' : 'Publish Live'}
            </button>
          )}
        </div>
      </div>

      {/* Error message */}
      {errorMsg && (
        <div role="alert" className="bg-[var(--red-l)] text-[var(--red)] p-4 border-2 border-[var(--red)] rounded-2xl mb-8 font-black text-sm flex items-center gap-3 animate-pop">
          <span aria-hidden="true">⚠️</span> {errorMsg}
        </div>
      )}

      <form className="space-y-10">
        {/* Metadata section */}
        <section aria-labelledby="quiz-meta-heading" className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-lg bg-[var(--blue-l)] text-[var(--blue-d)]">
              <BookOpen size={20} />
            </div>
            <h2 id="quiz-meta-heading" className="text-xl font-heading text-[var(--text)]">
              General Intel
            </h2>
          </div>

          <div className="card p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--blue-l)] opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" aria-hidden="true" />

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="quiz-title" className="label">Quiz Title ✨</label>
              <input
                id="quiz-title"
                {...register('title')}
                className="input py-4 text-lg font-bold"
                placeholder="Give your quiz a legendary name..."
              />
            </div>

            <div className="md:col-span-2 space-y-2">
              <label htmlFor="quiz-description" className="label">Short Description</label>
              <textarea
                id="quiz-description"
                {...register('description')}
                rows={2}
                className="input p-4"
                placeholder="Briefly describe the challenge..."
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="quiz-category" className="label">Area of Knowledge</label>
              <input
                id="quiz-category"
                {...register('category')}
                className="input"
                placeholder="e.g. Astrophysics, Memetics..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="quiz-difficulty" className="label">Difficulty</label>
                <select id="quiz-difficulty" {...register('difficulty')} className="input">
                  <option value="easy">Beginner</option>
                  <option value="medium">Challenger</option>
                  <option value="hard">Master</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="quiz-timer" className="label">Speed (Sec)</label>
                <input
                  id="quiz-timer"
                  type="number"
                  {...register('timerSeconds', { valueAsNumber: true })}
                  className="input"
                  min={5}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Questions section */}
        <section aria-labelledby="quiz-questions-heading" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-[var(--pink-l)] text-[var(--pink-d)]">
                <Sparkles size={20} />
              </div>
              <h2 id="quiz-questions-heading" className="text-xl font-heading text-[var(--text)]">
                Challenge Pool
              </h2>
            </div>
            <span className="text-xs font-black text-[var(--muted)] uppercase tracking-wider">
              {fields.length} {fields.length === 1 ? 'Question' : 'Questions'}
            </span>
          </div>

          <div className="space-y-8">
            {fields.map((field, index) => {
              const isCorrect = (i: number) =>
                watch(`questions.${index}.correctOptionIndex`) === i;
              return (
                <div
                  key={field.id}
                  className="card p-0 overflow-hidden border-none shadow-[var(--sh)] group animate-slide-in"
                >
                  {/* Question header */}
                  <div className="bg-[var(--bg)] px-6 py-4 flex justify-between items-center border-b-2 border-white">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-[var(--purple)] text-sm">
                        {index + 1}
                      </span>
                      <span className="font-heading text-sm text-[var(--text)]">The Challenge</span>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remove question ${index + 1}`}
                      onClick={() => remove(index)}
                      className="p-2 text-[var(--red)] hover:bg-[var(--red-l)] rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="p-8 space-y-6 bg-white">
                    <div className="space-y-2">
                      <label
                        htmlFor={`question-${index}-prompt`}
                        className="label text-[10px]"
                      >
                        What is the question? 🤔
                      </label>
                      <input
                        id={`question-${index}-prompt`}
                        {...register(`questions.${index}.prompt`)}
                        className="input text-lg font-bold border-transparent bg-[var(--bg)] focus:bg-white focus:border-[var(--purple-l)] transition-all"
                        placeholder="Type your mind-bending question here..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label htmlFor={`question-${index}-points`} className="label text-[10px]">
                          Challenge Reward (Pts)
                        </label>
                        <input
                          id={`question-${index}-points`}
                          type="number"
                          {...register(`questions.${index}.points`, { valueAsNumber: true })}
                          className="input bg-[var(--bg)]"
                          min={1}
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor={`question-${index}-type`} className="label text-[10px]">
                          Answer Style
                        </label>
                        <select
                          id={`question-${index}-type`}
                          {...register(`questions.${index}.type`)}
                          className="input bg-[var(--bg)]"
                        >
                          <option value="mcq">Multiple Choice Grid</option>
                          <option value="tf">Logic: True / False</option>
                        </select>
                      </div>
                    </div>

                    {/* Answer options */}
                    <fieldset className="space-y-4 pt-4 border-t-2 border-[var(--bg)]">
                      <legend className="label text-[10px]">
                        Define the options &amp; pick the winning answer 👑
                      </legend>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              'relative flex items-center gap-3 p-2 rounded-2xl transition-all border-2',
                              isCorrect(i)
                                ? 'bg-[var(--green-l)] border-[var(--green)] shadow-sm'
                                : 'bg-[var(--bg)] border-transparent'
                            )}
                          >
                            <label className="cursor-pointer" aria-label={`Mark option ${String.fromCharCode(65 + i)} as correct`}>
                              <input
                                type="radio"
                                {...register(`questions.${index}.correctOptionIndex`, {
                                  valueAsNumber: true,
                                })}
                                value={i}
                                className="hidden peer"
                              />
                              <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center peer-checked:bg-[var(--green)] peer-checked:text-white transition-all text-[var(--muted)]">
                                {isCorrect(i) ? (
                                  <CheckCircle2 size={18} />
                                ) : (
                                  <span>{String.fromCharCode(65 + i)}</span>
                                )}
                              </div>
                            </label>
                            <label
                              htmlFor={`question-${index}-option-${i}`}
                              className="sr-only"
                            >
                              Option {String.fromCharCode(65 + i)}
                            </label>
                            <input
                              id={`question-${index}-option-${i}`}
                              {...register(`questions.${index}.options.${i}`)}
                              className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-sm text-[var(--text)] p-2"
                              placeholder={`Answer Option ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    </fieldset>
                  </div>
                </div>
              );
            })}

            <button
              type="button"
              aria-label="Add next question"
              onClick={addQuestion}
              className="w-full flex flex-col items-center justify-center gap-2 p-10 rounded-[30px] border-4 border-dashed border-[var(--purple-l)] text-[var(--muted)] hover:text-[var(--purple)] hover:border-[var(--purple)] hover:bg-white transition-all group"
            >
              <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm" aria-hidden="true">
                ➕
              </div>
              <span className="font-heading text-lg">Add Next Question</span>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                MCQ or True/False
              </span>
            </button>
          </div>
        </section>
      </form>

      {/* Floating save bar */}
      <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
        <div className="bg-white/90 backdrop-blur-xl border-2 border-[var(--purple-l)] p-2 rounded-full shadow-[0_20px_50px_rgba(155,93,229,0.3)] flex items-center gap-2 pointer-events-auto animate-slide-up">
          <div className="px-6 border-r-2 border-[var(--bg)]">
            <p className="text-[10px] font-black text-[var(--muted)] uppercase">Status</p>
            <p className="text-xs font-bold text-[var(--purple)] uppercase">
              {isEditing ? 'Draft Mode' : 'New Build'}
            </p>
          </div>
          <button
            onClick={handleSubmit(onSaveDraft)}
            disabled={saving}
            className="btn btn-p px-10 py-3 rounded-full text-xs gap-2"
          >
            <Save size={14} aria-hidden="true" /> Quick Save
          </button>
        </div>
      </div>
    </div>
  );
}
