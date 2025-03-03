import { VoiceMemo } from "../service/model/VoiceMemo";

export class MemoService {

    // ok be sure to make this a env variable and also its https
    private static backendUrl = import.meta.env.VITE_TAMZA_BACKEND_URL;

    static async test(): Promise<boolean> {
        const response = await fetch(MemoService.backendUrl + "/api/Memo/test", {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': MemoService.backendUrl
            }
        });

        return response.ok;
    }

    static async getMemo(id: string): Promise<VoiceMemo> {

        const request = new Request(MemoService.backendUrl + "/api/memo/?id=" + id, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': MemoService.backendUrl
            }
        });
        
         
        const response = await fetch(request);

        if (!response.ok) {
            throw new Error("Memo not found");
        }
        
       
        const blob = await response.blob();
        return new VoiceMemo(id, blob);

    }

    /**
     * 
     * @param blob of the voice memo 
     * @returns the id of the memo
     */
    static async postMemo(memo: Blob): Promise<string> {
        const formData = new FormData();
        formData.append("file", memo, "audio.mp3");

        const response = await fetch(MemoService.backendUrl + '/api/Memo', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': MemoService.backendUrl
            }
        })

  

        return response.text();
    }
}