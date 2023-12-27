export class VoiceMemo {

    id: string;
    blob: Blob;


    constructor(id: string, blob: Blob) {
        this.id = id;
        this.blob = blob;
    }
}