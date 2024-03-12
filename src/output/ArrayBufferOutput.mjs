import {BufferOutput} from "./BufferOutput.mjs";

/**
 * Class ArrayBufferOutput
 */
class ArrayBufferOutput extends BufferOutput {
    /**
     * @returns {Promise<ArrayBuffer>}
     *
     * @throws {Error}
     */
    async generate() {
        this.log.log(`Generate ${ArrayBuffer.name} zip`);

        return this.generateZip("arraybuffer");
    }
}

export {ArrayBufferOutput};
