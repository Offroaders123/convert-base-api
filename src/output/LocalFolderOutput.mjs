import {AbstractOutput} from "./AbstractOutput.mjs";
import {AbstractInput} from "../input/AbstractInput.mjs";
import {AbstractLog} from "../log/AbstractLog.mjs";
import {copyFile, mkdir, readdir, readFile, rename, rmdir, stat, writeFile} from "fs/promises";
import {dirname, join} from "path";
import {existsSync} from "fs";
import { AbstractInputEntry } from "../input/entry/AbstractInputEntry.mjs";

/**
 * Class LocalFolderOutput
 */
class LocalFolderOutput extends AbstractOutput {
    /**
     * @inheritDoc
     *
     * @param {string} path
     */
    constructor(path) {
        super();

        /**
         * @type {string}
         *
         * @protected
         */
        this.path = path;
    }

    /**
     * @param {AbstractInput} input
     * @param {AbstractLog} log
     *
     * @returns {Promise<void>}
     */
    async _init(input, log) {
        await super._init(input, log);

        if (await this.exists(".")) {
            this.log.log(`Remove exists output`);

            await this.delete(".");
        }
    }

    /**
     * @param {AbstractInputEntry} entry
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async applyInputEntry(entry) {
        await entry.applyToFolder(this.path);
    }

    /**
     * @returns {Promise<string>}
     *
     * @throws {Error}
     */
    async generate() {
        this.log.log(`Output: ${this.path}`);

        return this.path;
    }

    /**
     * @param {string} path
     *
     * @returns {Promise<boolean>}
     *
     * @throws {Error}
     */
    async exists(path) {
        return existsSync(this.p(path));
    }

    /**
     * @param {string} from
     * @param {string} to
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async rename(from, to) {
        if (await this.exists(to)) {
            await this.delete(to);
        }

        await mkdir(dirname(this.p(to)), {recursive: true});
        await rename(this.p(from), this.p(to));
    }

    /**
     * @param {string} file
     *
     * @returns {Promise<Buffer>}
     *
     * @throws {Error}
     */
    async read(file) {
        return readFile(this.p(file));
    }

    /**
     * @param {string} file
     * @param {Buffer} data
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async write(file, data) {
        await mkdir(dirname(this.p(file)), {recursive: true});
        await writeFile(this.p(file), data);
    }

    /**
     * @param {string} path
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async delete(path) {
        await rmdir(this.p(path), {recursive: true});
    }

    /**
     * @param {string} from
     * @param {string} to
     *
     * @returns {Promise<void>}
     *
     * @throws {Error}
     */
    async copy(from, to) {
        if ((await stat(this.p(from))).isDirectory()) {
            await this.copyScanFiles(from, to);
        } else {
            await mkdir(dirname(this.p(to)), {recursive: true});
            await copyFile(this.p(from), this.p(to));
        }
    }

    /**
     * @param {string} from
     * @param {string} to
     *
     * @returns {Promise<void>}
     *
     * @private
     */
    async copyScanFiles(from, to) {
        for (const dirent of await readdir(this.p(from), {withFileTypes: true})) {
            if (dirent.isDirectory()) {
                await mkdir(this.p(to, dirent.name), {recursive: true});
                await this.copyScanFiles(join(from, dirent.name), join(to, dirent.name));
            } else {
                await mkdir(this.p(to), {recursive: true});
                await copyFile(this.p(from, dirent.name), this.p(to, dirent.name));
            }
        }
    }

    /**
     * @param {string} name
     *
     * @returns {Promise<string|null>}
     *
     * @throws {Error}
     */
    async lookupFile(name) {
        return this.lookupFileScanFiles(name, ".");
    }

    /**
     * @param {string} name
     * @param {string} p
     *
     * @returns {Promise<string|null>}
     *
     * @private
     */
    async lookupFileScanFiles(name, p) {
        for (const dirent of await readdir(join(this.path, p), {withFileTypes: true})) {
            if (dirent.isDirectory()) {
                const path = await this.lookupFileScanFiles(name, join(p, dirent.name));
                if (path) {
                    return path;
                }
            } else {
                if (dirent.name === name) {
                    return p;
                }
            }
        }

        return null;
    }

    /**
     * @param {string[]} p
     *
     * @returns {string}
     *
     * @protected
     */
    p(...p) {
        return join(this.path, ...p);
    }
}

export {LocalFolderOutput};
