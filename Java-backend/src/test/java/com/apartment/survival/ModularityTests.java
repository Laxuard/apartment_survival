package com.apartment.survival;

import org.junit.jupiter.api.Test;
import org.springframework.modulith.core.ApplicationModules;
import org.springframework.modulith.docs.Documenter;

class ModularityTests {

    ApplicationModules modules = ApplicationModules.of(SurvivalApplication.class);

    @Test
    void verifyModularStructure() {
        modules.verify();
    }

    @Test
    void createDocumentation() {
        new Documenter(modules)
                .writeDocumentation()
                .writeModulesAsPlantUml()
                .writeModuleCanvases();
    }

}
