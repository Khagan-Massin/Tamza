import { VoiceMemo } from "./VoiceMemo";

export class MemoService {

    private static backendUrl = "http://localhost:7097";

    async getMemo(id: string): Promise<VoiceMemo> {


        const response = await fetch(MemoService.backendUrl + "/memo/" + id)
        const blob = await response.blob();
        return new VoiceMemo(id, blob);

    }

    async postMemo(memo: Blob): Promise<string> {
        const formData = new FormData();
        formData.append("file", memo);

        const response = await fetch(MemoService.backendUrl + '/api/Memo', {
            method: 'POST',
            body: formData,
            mode: 'cors',
            headers: {
                'Access-Control-Allow-Origin': MemoService.backendUrl
            }
        })

        if (response.ok) {
            return await response.text(); // returns the id of the memo
        }

        // TODO: handle error
        throw new Error("Error posting memo");
    }
}