import { Button } from "@chakra-ui/button";
import { FormControl, FormErrorMessage, FormLabel } from "@chakra-ui/form-control";
import { Input } from "@chakra-ui/input";
import { Grid, VStack } from "@chakra-ui/layout";
import { Drawer, DrawerBody, DrawerCloseButton, DrawerContent, DrawerFooter, DrawerHeader, DrawerOverlay } from "@chakra-ui/modal";
import axios from "axios";
import { Field, FieldArray, FieldProps, Formik } from "formik";
import * as React from "react";
import { useDisclosure } from '@chakra-ui/hooks';

export const UpdateCollectionActionDrawer = ({ collection, data }: { collection: object; data: object }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const btnRef = React.useRef();
    const [ formValues, setFormValues ] = React.useState<object>();

    React.useEffect(() => {
        // console.log({ data });
        setFormValues(data);
    }, [data]);

    return (
        <>
            <Button ref={btnRef} colorScheme="blue" borderRadius={0} size="sm" onClick={onOpen}>Update</Button>
            <Drawer
                isOpen={isOpen}
                placement="right"
                onClose={onClose}
                finalFocusRef={btnRef}
                size="lg"
            >
                <DrawerOverlay>
                    <Formik
                        initialValues={formValues}
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
                                            <FieldArray>
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
                                                                {({ field, form, meta }: FieldProps) => (
                                                                    <FormControl isInvalid={!!(columnErrors[column.property] && columnTouched[column.property])}>
                                                                        <Input
                                                                            placeholder={`${column.property}`.toUpperCase()}
                                                                            {...field}
                                                                        />
                                                                        <FormErrorMessage>{errors[column.property]}</FormErrorMessage>
                                                                    </FormControl>
                                                                )}
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
                                        let vals = values;
                                        delete vals["updateAction"];
                                        delete vals["deleteAction"];
                                        // delete vals["_id"];
                                        delete vals["__v"];
                                        console.log({ vals });
                                        axios({
                                            method: 'put',
                                            url: `http://localhost:3005/api/${collection.collection.toLowerCase()}/${values["_id"]}`,
                                            data: {
                                                ...vals
                                            }
                                        }).then(function (response) {
                                            console.log({ response });
                                        });
                                    }}>
                                        Update
                    </Button>
                                </DrawerFooter>
                            </DrawerContent>
                        )}
                    </Formik>
                </DrawerOverlay>
            </Drawer>
        </>
    )
}