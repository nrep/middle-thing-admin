import * as React from "react";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { ColorModeSwitcher } from "./../../ColorModeSwitcher";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure,
  Input,
  Select,
  Grid,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { Formik, Form, Field, FieldProps, FieldArray } from 'formik';
import * as Yup from 'yup';
import axios from "axios";
import { CollectionTable, ReactTableColumnProps } from "../../components/CollectionTable";
import { Link as RouteLink } from "react-router-dom";

interface IValueType {
  name: string;
  value: string;
}

export const HomePage = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();
  const [valueTypes, setValueTypes] = React.useState<IValueType[]>([
    {
      name: "String",
      value: "String"
    },
    {
      name: "Buffer",
      value: "Buffer"
    },
    {
      name: "Boolean",
      value: "Boolean"
    },
    {
      name: "Date",
      value: "Date"
    },
    {
      name: "Number",
      value: "Number"
    },
    {
      name: "Mixed",
      value: "mongoose.Schema.Types.Mixed"
    },
    {
      name: "ObjectId",
      value: "mongoose.Schema.Types.ObjectId"
    },
    {
      name: "Decimal128",
      value: "mongoose.Schema.Types.Decimal128"
    },
    {
      name: "Array",
      value: "mongoose.Schema.Types.[]"
    }
  ])

  const [tableData, setTableData] = React.useState<object[]>();
  const [tableColumns, setTableColumns] = React.useState<ReactTableColumnProps[]>();
  const [columnCount, setColumnCount] = React.useState<number>(1);

  const CreateCollectionSchema = Yup.object().shape({
    collection: Yup.string().required(),
    columns: Yup.array().of(
      Yup.object().shape({
        property: Yup.string(),
        valueType: Yup.string(),
        displayText: Yup.string()
      })
    ),
    displayValue: Yup.string()
  })

  const [collections, setCollections] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios({
      url: 'http://localhost:3005/collections',
    }).then(function (response) {
      console.log({ responsee: response });
      let columns: ReactTableColumnProps[] = [{
        Header: "Collection Name",
        accessor: "name"
      }, {
        Header: "Actions",
        accessor: "actions"
      }]
      let data: object[] = [];
      const object = response.data;
      const valweTypes = valueTypes;
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          // Retrieve collection
          const element = object[key];

          // Add collection to valueTypes
          console.log({ element });
          valweTypes.push({ name: element.collection, value: `{ type: mongoose.Schema.Types.ObjectId, ref: '${element.collection}' }` });

          // Create Collection Button
          data.push({
            name: element.collection, actions: (
              <Button variant="solid" colorScheme="blue" borderRadius={0} size="sm">
                <RouteLink to={`/collection/${element.collection}`}>
                  <Link><Text textAlign="start">View</Text></Link>
                </RouteLink>
              </Button>
            )
          });
        }
      }
      setValueTypes(valweTypes);
      // console.log({ columns, data });
      setTableColumns(columns);
      setTableData(data);
    });
  }, []);

  function onChangeProducts(e, values, setValues) {
    // update dynamic form
    setColumnCount(columnCount + 1);
    const columns = [...values.columns];
    const numberOfColumns = columnCount;
    const previousNumber = numberOfColumns - 1;
    if (previousNumber < numberOfColumns) {
      for (let i = previousNumber; i < numberOfColumns; i++) {
        columns.push({
          property: "",
          valueType: ""
        });
      }
    } else {
      for (let i = previousNumber; i >= numberOfColumns; i--) {
        columns.splice(i, 1);
      }
    }
    setValues({ ...values, columns });
  }

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
          size="xl"
        >
          <DrawerOverlay>
            <Formik
              initialValues={{
                collection: '',
                columns: [
                  {
                    property: '',
                    valueType: ''
                  }
                ]
              }}
              validationSchema={CreateCollectionSchema}
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
                      <Field type="text" name="collection">
                        {({ field, form, meta }: FieldProps) => (
                          <FormControl
                            isInvalid={
                              !!(
                                form.errors.collection &&
                                form.touched.collection
                              )
                            }
                          >
                            <FormLabel htmlFor="customerFirstName">
                              Collection Name
                            </FormLabel>
                            <Input placeholder="Collection name" id="collection" {...field} />
                            <FormErrorMessage>
                              {form.errors.collection}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      <Button
                        colorScheme="blue"
                        borderRadius={0}
                        size="sm"
                        onClick={(e) =>
                          onChangeProducts(
                            e,
                            values,
                            setValues
                          )
                        }
                      >
                        NEW
                      </Button>
                      <FieldArray name="columns">
                        {() =>
                          values.columns.map((column, i) => {
                            const columnErrors =
                              (errors.columns?.length &&
                                errors.columns[i]) ||
                              {};
                            const columnTouched =
                              (touched.columns?.length &&
                                touched.columns[i]) ||
                              {};
                            return (
                              <Grid key={i} w="100%" templateColumns="repeat(3, 1fr)" gap={3}>
                                <Field name={`columns.${i}.property`}>
                                  {({ field, form, meta }: FieldProps) => (
                                    <FormControl isInvalid={!!(columnErrors["property"] && columnTouched.property)}>
                                      <Input
                                        placeholder="Property name"
                                        onChange={(e) => {
                                          form.setFieldValue(`columns.${i}.property`, e.target.value);
                                        }}
                                      />
                                      <FormErrorMessage>{errors["property"]}</FormErrorMessage>
                                    </FormControl>
                                  )}
                                </Field>
                                <Field name={`columns.${i}.valueType`}>
                                  {({ field, form, meta }: FieldProps) => (
                                    <FormControl isInvalid={!!(columnErrors["valueType"] && columnTouched.valueType)}>
                                      <Select
                                        placeholder="Select value type"
                                        onChange={(e) => form.setFieldValue(`columns.${i}.valueType`, e.currentTarget.value)}
                                      >
                                        {valueTypes.map(v => <option value={v.value}>{v.name}</option>)}
                                      </Select>
                                    </FormControl>
                                  )}
                                </Field>
                                <Field name={`columns.${i}.displayName`}>
                                  {({ field, form, meta }: FieldProps) => (
                                    <FormControl isInvalid={!!(columnErrors["displayName"] && columnTouched.displayName)}>
                                      <Input
                                        placeholder="Display Name"
                                        onChange={(e) => {
                                          form.setFieldValue(`columns.${i}.displayName`, e.target.value);
                                        }}
                                      />
                                      <FormErrorMessage>{errors["displayName"]}</FormErrorMessage>
                                    </FormControl>
                                  )}
                                </Field>
                              </Grid>
                            );
                          })
                        }
                      </FieldArray>
                      <Field type="text" name="displayValue">
                        {({ field, form, meta }: FieldProps) => (
                          <FormControl
                            isInvalid={
                              !!(
                                form.errors.displayValue &&
                                form.touched.displayValue
                              )
                            }
                          >
                            <FormLabel htmlFor="displayValue">
                              Display Value
                            </FormLabel>
                            <Input placeholder="Display Value" id="displayValue" {...field} />
                            <FormErrorMessage>
                              {form.errors.displayValue}
                            </FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </VStack>
                  </DrawerBody>

                  <DrawerFooter>
                    <Button variant="outline" mr={3} onClick={onClose}>
                      Cancel
                  </Button>
                    <Button type="submit" colorScheme="blue" onClick={() => {
                      axios({
                        method: 'post',
                        url: 'http://localhost:3005/collections',
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
  );
};