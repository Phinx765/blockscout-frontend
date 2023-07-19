import { Flex, Grid, Icon, Box, Text, chakra, Skeleton } from '@chakra-ui/react';
import { route } from 'nextjs-routes';
import React from 'react';

import type { SearchResultItem } from 'types/api/search';

import blockIcon from 'icons/block.svg';
import labelIcon from 'icons/publictags.svg';
import iconSuccess from 'icons/status/success.svg';
import txIcon from 'icons/transactions.svg';
import dayjs from 'lib/date/dayjs';
import highlightText from 'lib/highlightText';
import * as mixpanel from 'lib/mixpanel/index';
import { saveToRecentKeywords } from 'lib/recentSearchKeywords';
import Address from 'ui/shared/address/Address';
import AddressIcon from 'ui/shared/address/AddressIcon';
import AddressLink from 'ui/shared/address/AddressLink';
import HashStringShortenDynamic from 'ui/shared/HashStringShortenDynamic';
import LinkInternal from 'ui/shared/LinkInternal';
import ListItemMobile from 'ui/shared/ListItemMobile/ListItemMobile';
import { getItemCategory, searchItemTitles } from 'ui/shared/search/utils';
import TokenLogo from 'ui/shared/TokenLogo';

interface Props {
  data: SearchResultItem;
  searchTerm: string;
  isLoading?: boolean;
}

const SearchResultListItem = ({ data, searchTerm, isLoading }: Props) => {

  const handleLinkClick = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    saveToRecentKeywords(searchTerm);
    mixpanel.logEvent(mixpanel.EventTypes.SEARCH_QUERY, {
      'Search query': searchTerm,
      'Source page type': 'Search results',
      'Result URL': e.currentTarget.href,
    });
  }, [ searchTerm ]);

  const firstRow = (() => {
    switch (data.type) {
      case 'token': {
        const name = data.name + (data.symbol ? ` (${ data.symbol })` : '');

        return (
          <Flex alignItems="flex-start" flexGrow={ 1 } overflow="hidden">
            <TokenLogo boxSize={ 6 } data={ data } flexShrink={ 0 } isLoading={ isLoading }/>
            <LinkInternal
              ml={ 2 }
              href={ route({ pathname: '/token/[hash]', query: { hash: data.address } }) }
              fontWeight={ 700 }
              wordBreak="break-all"
              isLoading={ isLoading }
              onClick={ handleLinkClick }
              flexGrow={ 1 }
              overflow="hidden"
            >
              <Skeleton
                isLoaded={ !isLoading }
                dangerouslySetInnerHTML={{ __html: highlightText(name, searchTerm) }}
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
              />
            </LinkInternal>
          </Flex>
        );
      }

      case 'contract':
      case 'address': {
        const shouldHighlightHash = data.address.toLowerCase() === searchTerm.toLowerCase();
        return (
          <Flex alignItems="center" overflow="hidden">
            <Address>
              <AddressIcon address={{ hash: data.address, is_contract: data.type === 'contract', implementation_name: null }} mr={ 2 } flexShrink={ 0 }/>
              <Box as={ shouldHighlightHash ? 'mark' : 'span' } display="block" whiteSpace="nowrap" overflow="hidden">
                <AddressLink type="address" hash={ data.address } fontWeight={ 700 } display="block" w="100%" onClick={ handleLinkClick }/>
              </Box>
            </Address>
            { data.is_smart_contract_verified && <Icon as={ iconSuccess } color="green.500" ml={ 2 }/> }
          </Flex>
        );
      }

      case 'label': {
        return (
          <Flex alignItems="flex-start">
            <Icon as={ labelIcon } boxSize={ 6 } mr={ 2 } color="gray.500"/>
            <LinkInternal
              href={ route({ pathname: '/address/[hash]', query: { hash: data.address } }) }
              fontWeight={ 700 }
              wordBreak="break-all"
              isLoading={ isLoading }
              onClick={ handleLinkClick }
            >
              <span dangerouslySetInnerHTML={{ __html: highlightText(data.name, searchTerm) }}/>
            </LinkInternal>
          </Flex>
        );
      }

      case 'block': {
        const shouldHighlightHash = data.block_hash.toLowerCase() === searchTerm.toLowerCase();
        return (
          <Flex alignItems="center">
            <Icon as={ blockIcon } boxSize={ 6 } mr={ 2 } color="gray.500"/>
            <LinkInternal
              fontWeight={ 700 }
              href={ route({ pathname: '/block/[height_or_hash]', query: { height_or_hash: String(data.block_hash) } }) }
              onClick={ handleLinkClick }
              mr={ 4 }
            >
              <Box as={ shouldHighlightHash ? 'span' : 'mark' }>{ data.block_number }</Box>
            </LinkInternal>
          </Flex>
        );
      }

      case 'transaction': {
        return (
          <Flex alignItems="center" overflow="hidden">
            <Icon as={ txIcon } boxSize={ 6 } mr={ 2 } color="gray.500"/>
            <chakra.mark display="block" overflow="hidden">
              <AddressLink hash={ data.tx_hash } type="transaction" fontWeight={ 700 } display="block" onClick={ handleLinkClick }/>
            </chakra.mark>
          </Flex>
        );
      }
    }
  })();

  const secondRow = (() => {
    switch (data.type) {
      case 'token': {
        return (
          <Grid templateColumns="1fr auto" overflow="hidden" gap={ 5 }>
            <Skeleton isLoaded={ !isLoading } overflow="hidden" display="flex" alignItems="center">
              <HashStringShortenDynamic hash={ data.address }/>
              { data.is_smart_contract_verified && <Icon as={ iconSuccess } color="green.500" ml={ 2 }/> }
            </Skeleton>
            <Text overflow="hidden" whiteSpace="nowrap" textOverflow="ellipsis" fontWeight={ 700 }>
              { data.token_type === 'ERC-20' && data.exchange_rate && `$${ Number(data.exchange_rate).toLocaleString() }` }
              { data.token_type !== 'ERC-20' && data.total_supply && `Items ${ Number(data.total_supply).toLocaleString() }` }
            </Text>
          </Grid>
        );
      }
      case 'block': {
        const shouldHighlightHash = data.block_hash.toLowerCase() === searchTerm.toLowerCase();
        return (
          <>
            <Box as={ shouldHighlightHash ? 'mark' : 'span' } display="block" whiteSpace="nowrap" overflow="hidden" mb={ 1 }>
              <HashStringShortenDynamic hash={ data.block_hash }/>
            </Box>
            <Text variant="secondary" mr={ 2 }>{ dayjs(data.timestamp).format('llll') }</Text>
          </>
        );
      }
      case 'transaction': {
        return (
          <Text variant="secondary">{ dayjs(data.timestamp).format('llll') }</Text>
        );
      }
      case 'label': {
        return (
          <Flex alignItems="center" justifyContent="space-between">
            <Box overflow="hidden">
              <HashStringShortenDynamic hash={ data.address }/>
            </Box>
            { data.is_smart_contract_verified && <Icon as={ iconSuccess } color="green.500" ml={ 2 }/> }
          </Flex>
        );
      }
      case 'contract':
      case 'address': {
        const shouldHighlightHash = data.address.toLowerCase() === searchTerm.toLowerCase();
        return data.name ? <span dangerouslySetInnerHTML={{ __html: shouldHighlightHash ? data.name : highlightText(data.name, searchTerm) }}/> : null;
      }

      default:
        return null;
    }
  })();

  const category = getItemCategory(data);

  return (
    <ListItemMobile py={ 3 } fontSize="sm" rowGap={ 2 }>
      <Flex justifyContent="space-between" w="100%" overflow="hidden" lineHeight={ 6 }>
        { firstRow }
        <Skeleton isLoaded={ !isLoading } color="text_secondary" ml={ 8 } textTransform="capitalize">
          <span>{ category ? searchItemTitles[category].itemTitleShort : '' }</span>
        </Skeleton>
      </Flex>
      { Boolean(secondRow) && (
        <Box w="100%" overflow="hidden" whiteSpace="nowrap">
          { secondRow }
        </Box>
      ) }
    </ListItemMobile>
  );
};

export default SearchResultListItem;
