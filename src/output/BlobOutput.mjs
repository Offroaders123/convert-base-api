import {BufferOutput} from "./BufferOutput.mjs";

/**
 * Class BlobOutput
 */
class BlobOutput extends BufferOutput {
    /**
     * @returns {Promise<Blob>}
     *
     * @throws {Error}
     */
    async generate() {
        this.log.log(`Generate ${Blob.name} zip`);

        return this.generateZip("blob");
    }
}

export {BlobOutput};
