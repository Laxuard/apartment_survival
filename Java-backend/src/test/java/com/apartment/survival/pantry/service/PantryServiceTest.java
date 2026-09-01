package com.apartment.survival.pantry.service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.pantry.dto.PantryRequest;
import com.apartment.survival.pantry.dto.PantryResponse;
import com.apartment.survival.pantry.model.PantryItem;
import com.apartment.survival.pantry.repository.PantryRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("PantryService Unit Tests")
class PantryServiceTest {

    @Mock
    private PantryRepository pantryRepository;

    @Mock
    private HouseholdPublicApi householdPublicApi;

    @InjectMocks
    private PantryService pantryService;

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID ITEM_ID = UUID.randomUUID();

    @Nested
    @DisplayName("getItems()")
    class GetItemsTests {

        @Test
        @DisplayName("Returns pantry items when household exists")
        void getItems_success() {
            when(householdPublicApi.existsActive(HOUSEHOLD_ID)).thenReturn(true);

            PantryItem item = PantryItem.builder()
                    .id(ITEM_ID)
                    .householdId(HOUSEHOLD_ID)
                    .name("Olive Oil")
                    .category("Cooking & Spices")
                    .quantity(1)
                    .unit("bottle")
                    .status("low")
                    .badgeLabel("1 left")
                    .iconName("droplet")
                    .onGroceryList(true)
                    .build();

            when(pantryRepository.findActiveByHouseholdId(HOUSEHOLD_ID)).thenReturn(List.of(item));

            List<PantryResponse.Detail> result = pantryService.getItems(HOUSEHOLD_ID);

            assertThat(result).hasSize(1);
            assertThat(result.get(0).name()).isEqualTo("Olive Oil");
            assertThat(result.get(0).status()).isEqualTo("low");
            assertThat(result.get(0).onGroceryList()).isTrue();
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when household does not exist")
        void getItems_householdNotFound() {
            when(householdPublicApi.existsActive(HOUSEHOLD_ID)).thenReturn(false);

            assertThatThrownBy(() -> pantryService.getItems(HOUSEHOLD_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createItem()")
    class CreateItemTests {

        @Test
        @DisplayName("Creates item with calculated status and badge label")
        void createItem_success() {
            when(householdPublicApi.existsActive(HOUSEHOLD_ID)).thenReturn(true);

            PantryRequest.Create request = new PantryRequest.Create(
                    "Whole Milk", "Dairy & Eggs", 4, "liters", "milk"
            );

            when(pantryRepository.save(any(PantryItem.class))).thenAnswer(invocation -> {
                PantryItem p = invocation.getArgument(0);
                p.setId(ITEM_ID);
                return p;
            });

            PantryResponse.Detail result = pantryService.createItem(HOUSEHOLD_ID, request);

            assertThat(result).isNotNull();
            assertThat(result.name()).isEqualTo("Whole Milk");
            assertThat(result.quantity()).isEqualTo(4);
            assertThat(result.status()).isEqualTo("in_stock");
            assertThat(result.badgeLabel()).isEqualTo("In Stock");
            assertThat(result.onGroceryList()).isFalse();
            verify(pantryRepository).save(any(PantryItem.class));
        }
    }

    @Nested
    @DisplayName("updateStock()")
    class UpdateStockTests {

        @Test
        @DisplayName("Updates stock quantity and recalculates status when depleted")
        void updateStock_depleted() {
            PantryItem item = PantryItem.builder()
                    .id(ITEM_ID)
                    .householdId(HOUSEHOLD_ID)
                    .name("Espresso Beans")
                    .category("Beverages")
                    .quantity(2)
                    .status("low")
                    .badgeLabel("2 left")
                    .iconName("coffee")
                    .onGroceryList(false)
                    .build();

            when(pantryRepository.findByIdAndHouseholdId(ITEM_ID, HOUSEHOLD_ID)).thenReturn(Optional.of(item));
            when(pantryRepository.save(any(PantryItem.class))).thenAnswer(i -> i.getArgument(0));

            PantryRequest.UpdateStock request = new PantryRequest.UpdateStock(0, null, null);
            PantryResponse.Detail result = pantryService.updateStock(HOUSEHOLD_ID, ITEM_ID, request);

            assertThat(result.quantity()).isEqualTo(0);
            assertThat(result.status()).isEqualTo("out");
            assertThat(result.badgeLabel()).isEqualTo("Out");
            assertThat(result.onGroceryList()).isTrue();
        }
    }

    @Nested
    @DisplayName("toggleGrocery()")
    class ToggleGroceryTests {

        @Test
        @DisplayName("Toggles grocery list flag")
        void toggleGrocery_success() {
            PantryItem item = PantryItem.builder()
                    .id(ITEM_ID)
                    .householdId(HOUSEHOLD_ID)
                    .name("Eggs")
                    .category("Dairy & Eggs")
                    .onGroceryList(false)
                    .build();

            when(pantryRepository.findByIdAndHouseholdId(ITEM_ID, HOUSEHOLD_ID)).thenReturn(Optional.of(item));
            when(pantryRepository.save(any(PantryItem.class))).thenAnswer(i -> i.getArgument(0));

            PantryRequest.ToggleGrocery request = new PantryRequest.ToggleGrocery(true);
            PantryResponse.GroceryToggle result = pantryService.toggleGrocery(HOUSEHOLD_ID, ITEM_ID, request);

            assertThat(result.onGroceryList()).isTrue();
            assertThat(item.isOnGroceryList()).isTrue();
            verify(pantryRepository).save(item);
        }
    }
}

