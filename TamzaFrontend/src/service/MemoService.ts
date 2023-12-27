import { VoiceMemo } from "../service/model/VoiceMemo";

export class MemoService {

    // ok be sure to make this a env variable and also its https
    private static backendUrl = "https://localhost:7097";

    async getMemo(id: string): Promise<VoiceMemo> {

        const request = new Request(MemoService.backendUrl + "/api/memo/?id=" + id, {
            method: 'GET',
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': MemoService.backendUrl
            }
        });

        console.log(request);

        const response = await fetch(request)
        const blob = await response.blob();
        return new VoiceMemo(id, blob);

    }
    //js doc
    /**
     * 
     * @param blob of the voice memo 
     * @returns the id of the memo
     */
    async postMemo(memo: Blob): Promise<string> {
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