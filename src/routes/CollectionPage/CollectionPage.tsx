import { Button } from "@chakra-ui/button";
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { useDisclosure } from "@chakra-ui/hooks";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Grid, VStack } from "@chakra-ui/layout";
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay } from "@chakra-ui/modal";
import { NumberDecrementStepper, NumberIncrementStepper, NumberInput, NumberInputField, NumberInputStepper } from "@chakra-ui/number-input";
import { Select } from "@chakra-ui/select";
import axios from "axios";
import { Field, FieldArray, FieldProps, Formik } from "formik";
import * as React from "react";
import { useParams } from "react-router";
import { useTable } from 'react-table'
import AsyncSelect from "react-select/async";
import { ColorModeSwitcher } from "../../ColorModeSwitcher";
import { CollectionTable } from "../../components/CollectionTable";
import { UpdateCollectionActionDrawer } from "../../components/UpdateCollectionActionDrawer";
import { ReactTableColumnProps } from './../../components/CollectionTable';

interface ISuggestion {
    label: string;
    value: string;
}

const baseUrl: string = `http://localhost:3005`;

const filterItems = async (collection: string, inputValue: string) => {
    const result = await axios.get(`${baseUrl}/api/${collection}`);
    const collectionDef = await axios.get(`${baseUrl}/collections/${collection}`);
    // console.log({ data: result.data.items });
    let itemOptions: ISuggestion[] = [];
    result.data.items.map((v) =>
        itemOptions.push({ label: `${v[collectionDef.data.displayValue]}`, value: v._id })
    );
    return itemOptions.filter((i) =>
        i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
};
const promiseOptions = (collection, inputValue) =>
    new Promise((resolve) => {
        setTimeout(async () => {
            console.log({ collection, inputValue })
            resolve(await filterItems(collection, inputValue));
        }, 1000);
    });

export const CollectionPage = () => {
    let { id } = useParams();
    const [collection, setCollection] = React.useState<{}>({});
    const [collections, setCollections] = React.useState<object[]>([]);
    const [collectionData, setCollectionData] = React.useState<[]>([]);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();
    const [tableData, setTableData] = React.useState<object[]>();
    const [tableColumns, setTableColumns] = React.useState<ReactTableColumnProps[]>();
    const [hasRef, setHasRef] = React.useState<boolean>(false);
    const [collectionRefs, setCollectionRefs] = React.useState<string[]>([]);

    React.useEffect(() => {
        axios({
            url: `http://localhost:3005/collections/${id.toLowerCase()}`,
        }).then(function (response) {
            console.log({ collection: response.data });
            const refs = [];
            response.data && response.data.columns && response.data.columns.forEach(column => {
                if (column.valueType.includes("ObjectId")) {
                    setHasRef(true);
                    refs.push(column.property)
                }
            });
            console.log({ refs });
            setCollectionRefs(refs);
            setCollection(response.data);
        });
        axios({
            url: `http://localhost:3005/collections`,
        }).then(function (response) {
            setCollections(response.data);
        });
    }, [id]);

    React.useEffect(() => {
        let populateParams = "";
        collectionRefs && collectionRefs.forEach(ref => populateParams += `populate[]=${ref}&`);
        console.log({ populateParams });
        collection && collection.collection && axios({
            url: `http://localhost:3005/api/${collection.collection.toLowerCase()}${populateParams && populateParams.length > 0 && `?${populateParams}`}`,
        }).then(function (response) {
            // console.log({ responseeee: response.data });
            // setCollectionData(response.data);
            let columns: ReactTableColumnProps[] = [];
            collection && collection.columns && collection.columns.forEach(column => {
                columns.push({
                    Header: column.displayName,
                    accessor: column.property
                })
            });
            columns.push({
                Header: "Update",
                accessor: "updateAction"
            }, {
                Header: "Delete",
                accessor: "deleteAction"
            })
            let data: object[] = [];
            response.data && response.data.items && Array.isArray(response.data.items) && response.data.items.length > 0 && response.data.items.forEach((document) => {
                const doc = document;
                doc["updateAction"] = <UpdateCollectionActionDrawer collection={collection} data={doc} />;
                doc["deleteAction"] = <Button colorScheme="red" borderRadius={0} size="sm" onClick={() => {
                    axios({
                        method: 'delete',
                        url: `http://localhost:3005/api/${collection.collection.toLowerCase()}/${document._id}`,
                    }).then(function (response) {///
                        // console.log({ response });
                    });
                }}>Delete</Button>
                console.log({ document });
                collection && collection.columns && collection.columns.forEach(column => {
                    if (column.valueType.includes("ObjectId")) {
                        const targetCollection = collections[column.valueType.split("ref: ")[1].split("'")[1].toLowerCase()];
                        console.log({ targetCollection })
                        doc[column.property] = targetCollection && document[column.property][targetCollection["displayValue"]];
                    } else {
                        doc[column.property] = document[column.property];
                    }
                });
                console.log({ doc });
                /* delete document["__v"];
                delete document["_id"]; */
                data.push(doc);
            });
            setTableColumns(columns);
            setTableData(data);
        });
    }, [id, collections])

    return (
        <Box flex={1}>
            <Flex mr={4} justifyContent="flex-end">
                <ColorModeSwitcher justifySelf="center" />
            </Flex>
            <Flex
                justifyContent="flex-end"
                mx={4}
                mt={4}
                py={2}
                px={2}
                boxShadow="1px 1px 1px rgba(0, 0, 0, 0.1)"
                borderStyle="solid"
                borderWidth="1px"
            >
                <Button ref={btnRef} colorScheme="blue" borderRadius={0} size="sm" onClick={onOpen}>NEW</Button>
                <Drawer
                    isOpen={isOpen}
                    placement="right"
                    onClose={onClose}
                    finalFocusRef={btnRef}
                    size="lg"
                >
                    <DrawerOverlay>
                        <Formik
                            initialValues={() => {
                                return collection && collection.columns && collection.columns.map((col) => {
                                    const { property, valueType } = col;
                                    return JSON.parse(`"{${property}": ${valueType}}`)
                                })
                            }}
                            // validationSchema={CreateCollectionSchema}
                            onSubmit={(values, actions) => {
                                // same shape as initial values
                                console.log("iiiiii");
                                console.log(values);
                            }}
                        >
                            {({ errors, values, touched, setValues }) => (
                                <DrawerContent>
                                    <DrawerCloseButton />
                                    <DrawerHeader>Create your account</DrawerHeader>

                                    <DrawerBody>
                                        <VStack spacing={3}>
                                            <Grid w="100%" templateColumns="repeat(2, 1fr)" gap={3}>
                                                <FieldArray name="columns">
                                                    {() =>
                                                        collection && collection.columns && collection.columns.map((column, i) => {
                                                            const columnErrors =
                                                                (errors.length &&
                                                                    errors[i]) ||
                                                                {};
                                                            const columnTouched =
                                                                (touched.length &&
                                                                    touched[i]) ||
                                                                {};
                                                            return (

                                                                <Field name={column.property}>
                                                                    {({ field, form, meta }: FieldProps) => {
                                                                        return (
                                                                            <FormControl isInvalid={!!(columnErrors[column.property] && columnTouched[column.property])}>
                                                                                <FormLabel htmlFor={column.property}>
                                                                                    {column.displayName}:
                                                                                </FormLabel>
                                                                                {column.valueType === "Number" && (
                                                                                    <NumberInput
                                                                                        type="number"
                                                                                        placeholder={column.displayName}
                                                                                        onChange={(str, num) => {
                                                                                            form.setFieldValue(column.property, num);
                                                                                        }}
                                                                                    >
                                                                                        <NumberInputField />
                                                                                        <NumberInputStepper>
                                                                                            <NumberIncrementStepper />
                                                                                            <NumberDecrementStepper />
                                                                                        </NumberInputStepper>
                                                                                    </NumberInput>
                                                                                )}
                                                                                {(column.valueType === "String" || column.valueType === "Date") && (
                                                                                    <Input
                                                                                        type={column.valueType === "Date" ? "date" : "text"}
                                                                                        placeholder={column.displayName}
                                                                                        onChange={(e) => {
                                                                                            form.setFieldValue(column.property, e.target.value);
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                                {column.valueType.includes("ObjectId") && (
                                                                                    <AsyncSelect
                                                                                        onChange={(v: ISuggestion) => {
                                                                                            form.setFieldValue(column.property, v.value);
                                                                                        }}
                                                                                        loadOptions={(inputValue) => promiseOptions(column.valueType.split("ref: ")[1].split("'")[1].toLowerCase(), inputValue)}
                                                                                    />
                                                                                )}
                                                                                <FormErrorMessage>{errors[column.property]}</FormErrorMessage>
                                                                            </FormControl>
                                                                        )
                                                                    }}
                                                                </Field>

                                                            );
                                                        })
                                                    }
                                                </FieldArray>
                                            </Grid>
                                        </VStack>
                                    </DrawerBody>

                                    <DrawerFooter>
                                        <Button variant="outline" mr={3} onClick={onClose}>
                                            Cancel
                  </Button>
                                        <Button type="submit" colorScheme="blue" onClick={() => {
                                            console.log({ values });
                                            axios({
                                                method: 'post',
                                                url: `http://localhost:3005/api/${collection.collection.toLowerCase()}`,
                                                data: {
                                                    ...values
                                                }
                                            }).then(function (response) {
                                                console.log({ response });
                                            });
                                        }}>
                                            Save
                    </Button>
                                    </DrawerFooter>
                                </DrawerContent>
                            )}
                        </Formik>
                    </DrawerOverlay>
                </Drawer>
            </Flex>
            <Flex
                mx={4}
                mt={4}
                py={2}
            >
                {tableData && Array.isArray(tableData) && tableData.length > 0 && tableColumns && Array.isArray(tableColumns) && tableColumns.length > 0 && <CollectionTable data={tableData} columns={tableColumns} />}
            </Flex>
        </Box>
    )
};