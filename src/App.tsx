import * as React from "react"
import {
  ChakraProvider,
  Box,
  Text,
  Link,
  VStack,
  Code,
  Grid,
  theme,
  HStack,
  StackDivider,
  GridItem,
  Flex
} from "@chakra-ui/react"
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link as RouteLink
} from "react-router-dom";
import { Logo } from "./Logo"
import { AboutPage, HomePage } from "./routes";
import axios from "axios";
import { CollectionPage } from "./routes/CollectionPage";

type NavLinkProps = { text: string };
const NavLink = ({ text }: NavLinkProps) => (
  <Link>
    <Text fontSize="xl">{text}</Text>
  </Link>
);

const SidebarLink = ({ text }: NavLinkProps) => (
  <Link textAlign="start">
    <Text fontSize="xl" textAlign="start" color="white">{text}</Text>
  </Link>
);

const CollectionsMenu = () => {
  const [collections, setCollections] = React.useState<any[]>([]);

  React.useEffect(() => {
    axios({
      url: 'http://localhost:3005/collections',
    }).then(function (response) {
      // console.log({ response });
      let data = [];
      const object = response.data;
      for (const key in object) {
        if (Object.prototype.hasOwnProperty.call(object, key)) {
          const element = object[key];
          data.push(element);
        }
      }
      setCollections(data);
    });
  }, []);

  return (
    <>
      <Box fontSize="md" my={3}>
        <Text ml={4} color="gray.500">Collections</Text>
      </Box>
      <VStack ml={4} alignItems="flex-start">
        {collections.map(v => (
          <RouteLink to={`/collection/${v.collection}`}>
            <SidebarLink text={v.collection} />
          </RouteLink>
        ))}
      </VStack>
    </>
  )
}

const Sidebar = () => {
  return (
    <Box bg="gray.900" w="20%" minH={window.innerHeight} spacing={3}>
      <Box fontSize="2xl" my={3}>
        <Text ml={4} color="white">Middle</Text>
      </Box>
      <VStack ml={4} alignItems="flex-start">
        <RouteLink to="/">
          <SidebarLink text="Home" />
        </RouteLink>
        <RouteLink to="/about">
          <SidebarLink text="About" />
        </RouteLink>
      </VStack>
      <CollectionsMenu />
    </Box>
  )
}

const NavBar = () => (
  <HStack spacing={3} divider={<StackDivider />} as="nav">
    <RouteLink to="/">
      <NavLink text="Home" />
    </RouteLink>
    <RouteLink to="/about">
      <NavLink text="About" />
    </RouteLink>
  </HStack>
);

export const App = () => (
  <ChakraProvider theme={theme}>
    <Flex w="100%" minH="100%">
      <Router>
        <Sidebar />
        <Switch>
          <Route path="/collection/:id">
            <CollectionPage />
          </Route>
          <Route path="/about">
            <AboutPage />
          </Route>
          <Route path="/">
            <HomePage />
          </Route>
        </Switch>
      </Router>
    </Flex>
  </ChakraProvider>
)
