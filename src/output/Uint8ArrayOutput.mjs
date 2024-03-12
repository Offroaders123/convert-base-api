import {BufferOutput} from "./BufferOutput.mjs";

/**
 * Class Uint8ArrayOutput
 */
class Uint8ArrayOutput extends BufferOutput {
    /**
     * @returns {Promise<Uint8Array>}
     *
     * @throws {Error}
     */
    async generate() {
        this.log.log(`Generate ${Uint8Array.name} zip`);

        return this.generateZip("uint8array");
    }
}

export {Uint8ArrayOutput};
