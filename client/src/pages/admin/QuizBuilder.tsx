import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import apiClient from '../../api/apiClient';
import { useQuery } from '@tanstack/react-query';
import { Trash2, ArrowLeft, Save, Send, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function QuizBuilder() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const isEditing = !!quizId;

  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { register, control, handleSubmit, reset, watch } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      difficulty: 'medium',
      timerSeconds: 30,
      questions: [
        { type: 'mcq', prompt: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 10, order: 0 }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });

  useQuery({
    queryKey: ['quiz', quizId],
    queryFn: async () => {
      if (!isEditing) return null;
      const res = await apiClient.get(`/quizzes/${quizId}`);
      reset(res.data.data);
      return res.data.data;
    },
    enabled: isEditing
  });

  const onSaveDraft = async (data: any) => {
    setSaving(true);
    setErrorMsg('');
    try {
      if (isEditing) {
        await apiClient.patch(`/quizzes/${quizId}`, data);
      } else {
        const res = await apiClient.post('/quizzes', data);
        navigate(`/admin/quizzes/${res.data.data._id}/edit`, { replace: true });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save quiz');
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
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to publish quiz');
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-32 animate-slide-in">
       {/* Breadcrumbs & Header */}
       <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-[var(--muted)] hover:text-[var(--purple)] transition-colors border-2 border-transparent hover:border-[var(--purple-l)]">
               <ArrowLeft size={18} />
            </Link>
            <div>
               <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest">Quiz Studio</p>
               <h1 className="text-3xl font-heading text-[var(--text)]">{isEditing ? 'Masterpiece Editor' : 'Craft New Quiz'}</h1>
            </div>
          </div>
          
          <div className="flex gap-3">
             <button onClick={handleSubmit(onSaveDraft)} disabled={saving} className="btn bg-white border-2 border-[var(--purple)] text-[var(--purple)] hover:bg-[var(--purple-l)] px-6 py-3 font-black text-sm gap-2">
               <Save size={18} /> {saving ? 'Drafting...' : 'Save Draft'}
             </button>
             {isEditing && (
               <button onClick={onPublish} disabled={publishing} className="btn btn-p px-8 py-3 text-sm gap-2 shadow-[0_10px_20px_rgba(155,93,229,0.2)]">
                  <Send size={18} /> {publishing ? 'Launching...' : 'Publish Live'}
               </button>
             )}
          </div>
       </div>

       {errorMsg && (
         <div className="bg-[var(--red-l)] text-[var(--red)] p-4 border-2 border-[var(--red)] rounded-2xl mb-8 font-black text-sm flex items-center gap-3 animate-pop">
           <span>⚠️</span> {errorMsg}
         </div>
       )}

       <form className="space-y-10">
          {/* Metadata Section */}
          <section className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-2 rounded-lg bg-[var(--blue-l)] text-[var(--blue-d)]"><BookOpen size={20} /></div>
                <h3 className="text-xl font-heading text-[var(--text)]">General Intel</h3>
             </div>
             
             <div className="card p-8 grid grid-cols-1 md:grid-cols-2 gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--blue-l)] opacity-20 rounded-full -translate-y-1/2 translate-x-1/2" />
                
                <div className="md:col-span-2 space-y-2">
                   <label className="label">Quiz Title ✨</label>
                   <input {...register('title')} className="input py-4 text-lg font-bold" placeholder="Give your quiz a legendary name..." />
                </div>
                
                <div className="md:col-span-2 space-y-2">
                   <label className="label">Short Description</label>
                   <textarea {...register('description')} rows={2} className="input p-4" placeholder="Briefly describe the challenge..." />
                </div>

                <div className="space-y-2">
                   <label className="label">Area of Knowledge</label>
                   <input {...register('category')} className="input" placeholder="e.g. Astrophysics, Memetics..." />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="label">Difficulty</label>
                      <select {...register('difficulty')} className="input">
                        <option value="easy">Beginner</option>
                        <option value="medium">Challenger</option>
                        <option value="hard">Master</option>
                      </select>
                   </div>
                   <div className="space-y-2">
                      <label className="label">Speed (Sec)</label>
                      <input type="number" {...register('timerSeconds', { valueAsNumber: true })} className="input" min={5} />
                   </div>
                </div>
             </div>
          </section>

          {/* Questions Section */}
          <section className="space-y-6">
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                   <div className="p-2 rounded-lg bg-[var(--pink-l)] text-[var(--pink-d)]"><Sparkles size={20} /></div>
                   <h3 className="text-xl font-heading text-[var(--text)]">Challenge Pool</h3>
                </div>
                <span className="text-xs font-black text-[var(--muted)] uppercase tracking-wider">{fields.length} Questions</span>
             </div>

             <div className="space-y-8">
                {fields.map((field: any, index) => (
                   <div key={field.id} className="card p-0 overflow-hidden border-none shadow-[var(--sh)] group animate-slide-in">
                      {/* Question Header */}
                      <div className="bg-[var(--bg)] px-6 py-4 flex justify-between items-center border-b-2 border-white">
                         <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center font-black text-[var(--purple)] text-sm">{index + 1}</span>
                            <span className="font-heading text-sm text-[var(--text)]">The Challenge</span>
                         </div>
                         <button type="button" onClick={() => remove(index)} className="p-2 text-[var(--red)] hover:bg-[var(--red-l)] rounded-xl transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 size={18} />
                         </button>
                      </div>

                      <div className="p-8 space-y-6 bg-white">
                         <div className="space-y-2">
                            <label className="label text-[10px]">What is the question? 🤔</label>
                            <input {...register(`questions.${index}.prompt`)} className="input text-lg font-bold border-transparent bg-[var(--bg)] focus:bg-white focus:border-[var(--purple-l)] transition-all" placeholder="Type your mind-bending question here..." />
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                               <label className="label text-[10px]">Challenge Reward (Pts)</label>
                               <input type="number" {...register(`questions.${index}.points`, { valueAsNumber: true })} className="input bg-[var(--bg)]" min={1} />
                            </div>
                            <div className="space-y-2">
                               <label className="label text-[10px]">Answer Style</label>
                               <select {...register(`questions.${index}.type`)} className="input bg-[var(--bg)]">
                                 <option value="mcq">Multiple Choice Grid</option>
                                 <option value="tf">Logic: True / False</option>
                               </select>
                            </div>
                         </div>

                         {/* MCQ Options with a premium look */}
                         <div className="space-y-4 pt-4 border-t-2 border-[var(--bg)]">
                           <p className="label text-[10px]">Define the options & pick the winning answer 👑</p>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {[0, 1, 2, 3].map(i => {
                                 const isCorrect = watch(`questions.${index}.correctOptionIndex`) === i;
                                 return (
                                    <div key={i} className={cn(
                                       "relative flex items-center gap-3 p-2 rounded-2xl transition-all border-2",
                                       isCorrect ? "bg-[var(--green-l)] border-[var(--green)] shadow-sm" : "bg-[var(--bg)] border-transparent"
                                    )}>
                                       <label className="cursor-pointer">
                                          <input 
                                            type="radio" 
                                            {...register(`questions.${index}.correctOptionIndex`, { valueAsNumber: true })} 
                                            value={i} 
                                            className="hidden peer"
                                          />
                                          <div className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center peer-checked:bg-[var(--green)] peer-checked:text-white transition-all text-[var(--muted)]">
                                             {isCorrect ? <CheckCircle2 size={18} /> : <span>{String.fromCharCode(65 + i)}</span>}
                                          </div>
                                       </label>
                                       <input 
                                          {...register(`questions.${index}.options.${i}`)} 
                                          className="flex-1 bg-transparent border-none focus:ring-0 font-bold text-sm text-[var(--text)] p-2" 
                                          placeholder={`Answer Option ${i+1}`} 
                                       />
                                    </div>
                                 );
                              })}
                           </div>
                         </div>
                      </div>
                   </div>
                ))}

                <button 
                  type="button" 
                  className="w-full flex flex-col items-center justify-center gap-2 p-10 rounded-[30px] border-4 border-dashed border-[var(--purple-l)] text-[var(--muted)] hover:text-[var(--purple)] hover:border-[var(--purple)] hover:bg-white transition-all group"
                  onClick={() => append({ type: 'mcq', prompt: '', options: ['', '', '', ''], correctOptionIndex: 0, points: 10, order: fields.length })}
                >
                  <div className="w-16 h-16 rounded-full bg-[var(--bg)] flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shadow-sm">➕</div>
                  <span className="font-heading text-lg">Add Next Question</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">MCQ or True/False</span>
                </button>
             </div>
          </section>
       </form>

       <div className="fixed bottom-0 left-0 right-0 p-6 flex justify-center pointer-events-none">
          <div className="bg-white/90 backdrop-blur-xl border-2 border-[var(--purple-l)] p-2 rounded-full shadow-[0_20px_50px_rgba(155,93,229,0.3)] flex items-center gap-2 pointer-events-auto animate-slide-up">
             <div className="px-6 border-r-2 border-[var(--bg)]">
                <p className="text-[10px] font-black text-[var(--muted)] uppercase">Status</p>
                <p className="text-xs font-bold text-[var(--purple)] uppercase">{isEditing ? 'Draft Mode' : 'New Build'}</p>
             </div>
             <button onClick={handleSubmit(onSaveDraft)} className="btn btn-p px-10 py-3 rounded-full text-xs gap-2">
                <Save size={14} /> Quick Save
             </button>
          </div>
       </div>
    </div>
  );
}
