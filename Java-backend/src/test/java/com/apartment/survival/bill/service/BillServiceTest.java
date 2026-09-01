package com.apartment.survival.bill.service;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.util.Currency;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.apartment.survival.bill.dto.BillRequest;
import com.apartment.survival.bill.dto.BillResponse;
import com.apartment.survival.bill.model.Bill;
import com.apartment.survival.bill.repository.BillRepository;
import com.apartment.survival.common.exception.type.ResourceNotFoundException;
import com.apartment.survival.household.api.HouseholdPublicApi;
import com.apartment.survival.household.api.HouseholdPublicDto;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("BillService Unit Tests")
class BillServiceTest {

    @Mock
    private BillRepository billRepository;

    @Mock
    private HouseholdPublicApi householdPublicApi;

    @InjectMocks
    private BillService billService;

    private static final UUID HOUSEHOLD_ID = UUID.randomUUID();
    private static final UUID BILL_ID = UUID.randomUUID();
    private static final UUID USER_ID = UUID.randomUUID();

    @Nested
    @DisplayName("getBills()")
    class GetBillsTests {

        @Test
        @DisplayName("Returns mapped bill details when household exists")
        void getBills_success() {
            HouseholdPublicDto household = new HouseholdPublicDto(
                    HOUSEHOLD_ID, "My Apt", Currency.getInstance("MAD"), ZoneId.of("Africa/Casablanca"),
                    false, 10, "SIMPLIFIED_DEBTS", "EQUAL", null
            );
            when(householdPublicApi.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(householdPublicApi.getActiveMemberUserIds(HOUSEHOLD_ID)).thenReturn(
                    Set.of(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID())
            );

            Bill bill = Bill.builder()
                    .id(BILL_ID)
                    .householdId(HOUSEHOLD_ID)
                    .title("Wi-Fi Fiber")
                    .amount(new BigDecimal("400.00"))
                    .currency("MAD")
                    .dueDays(3)
                    .dueText("Due in 3 days")
                    .autoSplit(true)
                    .iconName("wifi")
                    .isPaid(false)
                    .build();

            when(billRepository.findActiveByHouseholdId(HOUSEHOLD_ID)).thenReturn(List.of(bill));

            List<BillResponse.Detail> result = billService.getBills(HOUSEHOLD_ID);

            assertThat(result).hasSize(1);
            BillResponse.Detail item = result.get(0);
            assertThat(item.id()).isEqualTo(BILL_ID);
            assertThat(item.title()).isEqualTo("Wi-Fi Fiber");
            assertThat(item.amount()).isEqualByComparingTo(new BigDecimal("400.00"));
            assertThat(item.perPersonText()).contains("100 MAD / person (4 roommates)");
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when household does not exist")
        void getBills_householdNotFound() {
            when(householdPublicApi.findById(HOUSEHOLD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> billService.getBills(HOUSEHOLD_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }

    @Nested
    @DisplayName("createBill()")
    class CreateBillTests {

        @Test
        @DisplayName("Successfully creates and saves a bill")
        void createBill_success() {
            HouseholdPublicDto household = new HouseholdPublicDto(
                    HOUSEHOLD_ID, "My Apt", Currency.getInstance("MAD"), ZoneId.of("Africa/Casablanca"),
                    false, 10, "SIMPLIFIED_DEBTS", "EQUAL", null
            );
            when(householdPublicApi.findById(HOUSEHOLD_ID)).thenReturn(Optional.of(household));
            when(householdPublicApi.getActiveMemberUserIds(HOUSEHOLD_ID)).thenReturn(
                    Set.of(UUID.randomUUID(), UUID.randomUUID())
            );

            BillRequest.Create request = new BillRequest.Create("Electricity", new BigDecimal("300.00"), 5, true, "bolt");

            when(billRepository.save(any(Bill.class))).thenAnswer(invocation -> {
                Bill b = invocation.getArgument(0);
                b.setId(BILL_ID);
                return b;
            });

            BillResponse.Detail result = billService.createBill(HOUSEHOLD_ID, request);

            assertThat(result).isNotNull();
            assertThat(result.id()).isEqualTo(BILL_ID);
            assertThat(result.title()).isEqualTo("Electricity");
            assertThat(result.dueDays()).isEqualTo(5);
            assertThat(result.dueText()).isEqualTo("Due in 5 days");
            assertThat(result.perPersonText()).contains("150 MAD / person (2 roommates)");
            verify(billRepository).save(any(Bill.class));
        }
    }

    @Nested
    @DisplayName("payBill()")
    class PayBillTests {

        @Test
        @DisplayName("Marks bill as paid")
        void payBill_success() {
            Bill bill = Bill.builder()
                    .id(BILL_ID)
                    .householdId(HOUSEHOLD_ID)
                    .title("Water")
                    .amount(new BigDecimal("100.00"))
                    .isPaid(false)
                    .build();

            when(billRepository.findByIdAndHouseholdId(BILL_ID, HOUSEHOLD_ID)).thenReturn(Optional.of(bill));

            BillResponse.PayResponse result = billService.payBill(HOUSEHOLD_ID, BILL_ID, USER_ID);

            assertThat(result.success()).isTrue();
            assertThat(result.billId()).isEqualTo(BILL_ID);
            assertThat(bill.isPaid()).isTrue();
            assertThat(bill.getPaidByUserId()).isEqualTo(USER_ID);
            assertThat(bill.getPaidAt()).isNotNull();
            verify(billRepository).save(bill);
        }

        @Test
        @DisplayName("Throws ResourceNotFoundException when bill not found")
        void payBill_notFound() {
            when(billRepository.findByIdAndHouseholdId(BILL_ID, HOUSEHOLD_ID)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> billService.payBill(HOUSEHOLD_ID, BILL_ID, USER_ID))
                    .isInstanceOf(ResourceNotFoundException.class);
        }
    }
}

