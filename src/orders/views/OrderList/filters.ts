import { MultiAutocompleteChoiceType } from "@saleor/components/MultiAutocompleteSelectField";
import { findInEnum, findValueInEnum } from "@saleor/misc";
import {
  OrderFilterKeys,
  OrderListFilterOpts
} from "@saleor/orders/components/OrderListPage/filters";

import { IFilterElement } from "../../../components/Filter";
import {
  OrderFilterInput,
  OrderStatusFilter
} from "../../../types/globalTypes";
import {
  createFilterTabUtils,
  createFilterUtils,
  dedupeFilter,
  getGteLteVariables,
  getMinMaxQueryParam,
  getMultipleEnumValueQueryParam,
  getMultipleValueQueryParam,
  getSingleValueQueryParam
} from "../../../utils/filters";
import {
  OrderListUrlFilters,
  OrderListUrlFiltersEnum,
  OrderListUrlFiltersWithMultipleValues,
  OrderListUrlFiltersWithMultipleValuesEnum,
  OrderListUrlQueryParams
} from "../../urls";

export const ORDER_FILTERS_KEY = "orderFilters";

export function getFilterOpts(
  params: OrderListUrlFilters,
  channels: MultiAutocompleteChoiceType[]
): OrderListFilterOpts {
  return {
    channel: channels
      ? {
          active: params?.channel !== undefined || false,
          value: channels
        }
      : null,
    created: {
      active:
        [params?.createdFrom, params?.createdTo].some(
          field => field !== undefined
        ) || false,
      value: {
        max: params?.createdTo || "",
        min: params?.createdFrom || ""
      }
    },
    customer: {
      active: !!params?.customer,
      value: params?.customer
    },
    status: {
      active: params?.status !== undefined || false,
      value:
        dedupeFilter(
          params?.status?.map(status =>
            findValueInEnum(status, OrderStatusFilter)
          )
        ) || []
    }
  };
}

export function getFilterVariables(
  params: OrderListUrlFilters
): OrderFilterInput {
  return {
    channels: (params.channel as unknown) as string[],
    created: getGteLteVariables({
      gte: params.createdFrom,
      lte: params.createdTo
    }),
    customer: params.customer,
    search: params.query,
    status: params?.status?.map(status => findInEnum(status, OrderStatusFilter))
  };
}

export function getFilterQueryParam(
  filter: IFilterElement<OrderFilterKeys>
): OrderListUrlFilters {
  const { name } = filter;

  switch (name) {
    case OrderFilterKeys.created:
      return getMinMaxQueryParam(
        filter,
        OrderListUrlFiltersEnum.createdFrom,
        OrderListUrlFiltersEnum.createdTo
      );

    case OrderFilterKeys.status:
      return getMultipleEnumValueQueryParam(
        filter,
        OrderListUrlFiltersWithMultipleValuesEnum.status,
        OrderStatusFilter
      );

    case OrderFilterKeys.channel:
      return getMultipleValueQueryParam(
        filter,
        OrderListUrlFiltersWithMultipleValues.channel
      );

    case OrderFilterKeys.customer:
      return getSingleValueQueryParam(filter, OrderListUrlFiltersEnum.customer);
  }
}

export const {
  deleteFilterTab,
  getFilterTabs,
  saveFilterTab
} = createFilterTabUtils<OrderListUrlFilters>(ORDER_FILTERS_KEY);

export const { areFiltersApplied, getActiveFilters } = createFilterUtils<
  OrderListUrlQueryParams,
  OrderListUrlFilters
>({
  ...OrderListUrlFiltersEnum,
  ...OrderListUrlFiltersWithMultipleValuesEnum
});
