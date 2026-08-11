export const LoaderUtils = {

    /**
     * @param {FileList} files 
     * @returns {{[key:string]:File}}
     */
    createFilesMap: function (files) {

        const map = {};

        for (let i = 0; i < files.length; i++) {

            const file = files[i];
            map[file.name] = file;

        }

        return map;

    },

    /**
     * @param {DataTransferItemList} itemList 
     * @param {(files:FileList,filesMap:{[key:string]:File})=>void} onDone 
     */
    getFilesFromItemList: function (itemList, onDone) {

        // ToFIX: setURLModifier() breaks when the file being loaded is not in root

        let itemsCount = 0;
        let itemsTotal = 0;

        const files = [];
        const filesMap = {};

        function onEntryHandled() {

            itemsCount++;

            if (itemsCount === itemsTotal) {

                onDone(files, filesMap);

            }

        }

        /**
         * @param {FileSystemEntry } entry 
         */
        function handleEntry(entry) {

            if (entry.isDirectory) {

                const reader = entry.createReader();

                reader.readEntries(function (entries) {

                    for (let i = 0; i < entries.length; i++) {

                        handleEntry(entries[i]);

                    }

                    onEntryHandled();

                });

            } else if (entry.isFile) {

                entry.file(function (file) {

                    files.push(file);

                    filesMap[entry.fullPath.slice(1)] = file;

                    onEntryHandled();

                });

            }

            itemsTotal++;

        }

        for (let i = 0, length = itemList.length; i < length; i++) {

            const item = itemList[i];

            if (item.kind === 'file') {

                handleEntry(item.webkitGetAsEntry());

            }

        }

    }

};

