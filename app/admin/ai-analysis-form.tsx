'use client';

import {useFormStatus} from 'react-dom';

function SubmitButton({hasReview}:{hasReview:boolean}) {
  const {pending}=useFormStatus();
  return <div className="ai-analysis-submit">
    <button type="submit" disabled={pending} aria-busy={pending}>
      {pending ? 'Analisi in corso…' : hasReview ? 'Aggiorna analisi' : 'Analizza PDF con AI'}
    </button>
    {pending && <><div className="ai-analysis-progress" role="progressbar" aria-label="Analisi del manoscritto in corso"><span/></div><small>Sto leggendo il PDF e preparando il report. Non chiudere questa pagina.</small></>}
  </div>;
}

export function AiAnalysisForm({action,hasReview}:{action:(formData:FormData)=>void|Promise<void>;hasReview:boolean}) {
  return <form action={action}><SubmitButton hasReview={hasReview}/></form>;
}
